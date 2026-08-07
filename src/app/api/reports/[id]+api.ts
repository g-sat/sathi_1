import { connectDB } from '@/server/db';
import { InterventionReport } from '@/server/models/InterventionReport';
import { PatientProfile } from '@/server/models/PatientProfile';
import { serializeReport } from '@/server/serialize';
import { jsonError, safeJson } from '@/server/http';
import { withSession } from '@/server/auth';

async function assertCanAccessReport(
  session: { role: string; sub: string; patientProfileId?: string },
  report: { patientId: unknown }
) {
  const patient = await PatientProfile.findById(report.patientId).lean();
  if (!patient) return jsonError(404, 'Patient not found.');
  const isOwnerChw = session.role === 'chw' && String(patient.chwId) === session.sub;
  const isOwnPatient = session.role === 'patient' && session.patientProfileId === String(patient._id);
  if (!isOwnerChw && !isOwnPatient) return jsonError(403, 'You are not authorized to access this report.');
  return null;
}

export async function GET(request: Request, { id }: Record<string, string>) {
  await connectDB();
  const { session, error: authError } = withSession(request);
  if (authError) return authError;

  const report = await InterventionReport.findById(id).lean();
  if (!report) return jsonError(404, 'Report not found.');

  const error = await assertCanAccessReport(session, report);
  if (error) return error;

  return Response.json({ report: serializeReport(report) });
}

// PATCH /api/reports/[id] — { action: "publish" } finalizes the CHW-approved
// plan and makes it visible in the patient app.
export async function PATCH(request: Request, { id }: Record<string, string>) {
  await connectDB();
  const { session, error: authError } = withSession(request, 'chw');
  if (authError) return authError;

  const body = await safeJson(request);
  const report = await InterventionReport.findById(id);
  if (!report) return jsonError(404, 'Report not found.');

  const error = await assertCanAccessReport(session, report);
  if (error) return error;

  if (body.action === 'publish') {
    report.status = 'published';
    report.publishedAt = new Date();
    await report.save();
  } else {
    return jsonError(400, 'Unsupported action.');
  }

  return Response.json({ report: serializeReport(report) });
}
