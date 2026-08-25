import { withSession } from "@/server/auth";
import { connectDB } from "@/server/db";
import { generateFullReport, toReportSections } from "@/server/gemini";
import { jsonError, safeJson } from "@/server/http";
import { InterventionReport } from "@/server/models/InterventionReport";
import { PatientProfile } from "@/server/models/PatientProfile";
import { serializeReport } from "@/server/serialize";

async function assertCanAccessPatient(
  session: { role: string; sub: string; patientProfileId?: string },
  patientId: string,
) {
  const patient = await PatientProfile.findById(patientId).lean();
  if (!patient)
    return { patient: null, error: jsonError(404, "Patient not found.") };

  const isOwnerChw =
    session.role === "chw" && String(patient.chwId) === session.sub;
  const isOwnPatient =
    session.role === "patient" &&
    session.patientProfileId === String(patient._id);
  if (!isOwnerChw && !isOwnPatient) {
    return {
      patient: null,
      error: jsonError(403, "You are not authorized to view this report."),
    };
  }
  return { patient, error: null };
}

// GET /api/reports?patientId=...&status=published|draft (status optional)
export async function GET(request: Request) {
  await connectDB();
  const { session, error: authError } = withSession(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const patientId = url.searchParams.get("patientId");
  const status = url.searchParams.get("status");
  if (!patientId)
    return jsonError(400, "patientId query parameter is required.");

  const { error } = await assertCanAccessPatient(session, patientId);
  if (error) return error;

  const query: Record<string, unknown> = { patientId };
  if (status) query.status = status;

  const report = await InterventionReport.findOne(query)
    .sort({ updatedAt: -1 })
    .lean();
  if (!report) return Response.json({ report: null });
  return Response.json({ report: serializeReport(report) });
}

// POST /api/reports — CHW triggers the initial AI generation for a patient.
// If a draft already exists it is regenerated from scratch; published
// reports are left untouched (a new draft is created instead so the CHW can
// review before overwriting what the patient sees).
export async function POST(request: Request) {
  await connectDB();
  const { session, error: authError } = withSession(request, "chw");
  if (authError) return authError;

  const body = await safeJson(request);
  const patientId = String(body.patientId || "");
  if (!patientId) return jsonError(400, "patientId is required.");

  const { patient, error } = await assertCanAccessPatient(session, patientId);
  if (error) return error;

  const t0 = Date.now();
  let generated;
  try {
    generated = await generateFullReport(patient as any);
  } catch (err) {
    console.error(
      "[reports POST] generateFullReport failed after",
      Date.now() - t0,
      "ms:",
      err,
    );
    return jsonError(
      502,
      `Gemini generation failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  console.log(
    "[reports POST] generateFullReport succeeded in",
    Date.now() - t0,
    "ms",
  );
  const sections = toReportSections(generated);

  let report = await InterventionReport.findOne({
    patientId: patient!._id,
    status: "draft",
  });
  if (report) {
    report.sections = sections as any;
    await report.save();
  } else {
    report = await InterventionReport.create({
      patientId: patient!._id,
      chwId: patient!.chwId,
      status: "draft",
      sections,
    });
  }

  return Response.json({ report: serializeReport(report) }, { status: 201 });
}
