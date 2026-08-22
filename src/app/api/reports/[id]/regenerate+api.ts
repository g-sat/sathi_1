import { connectDB } from '@/server/db';
import { InterventionReport } from '@/server/models/InterventionReport';
import { PatientProfile } from '@/server/models/PatientProfile';
import { regenerateSection } from '@/server/gemini';
import { serializeReport } from '@/server/serialize';
import { jsonError, safeJson } from '@/server/http';
import { withSession } from '@/server/auth';
import { SECTION_ORDER } from '@/lib/constants';
import type { ReportSectionKey } from '@/types';

const VALID_SECTIONS: ReportSectionKey[] = SECTION_ORDER;

// POST /api/reports/[id]/regenerate — iterative refinement. The CHW sends a
// follow-up instruction for a single section (e.g. "Make the breakfast
// options strictly vegetarian") and only that section is regenerated.
export async function POST(request: Request, { id }: Record<string, string>) {
  await connectDB();
  const { session, error: authError } = withSession(request, 'chw');
  if (authError) return authError;

  const body = await safeJson(request);
  const section = body.section as ReportSectionKey;
  const instruction = String(body.instruction || '').trim();

  if (!VALID_SECTIONS.includes(section)) return jsonError(400, 'Invalid section.');
  if (!instruction) return jsonError(400, 'A follow-up instruction is required.');

  const report = await InterventionReport.findById(id);
  if (!report) return jsonError(404, 'Report not found.');

  const patient = await PatientProfile.findById(report.patientId);
  if (!patient) return jsonError(404, 'Patient not found.');
  if (String(patient.chwId) !== session.sub) {
    return jsonError(403, 'You are not authorized to edit this report.');
  }

  const current = (report.sections as any[]).find((s) => s.key === section);
  if (!current) return jsonError(404, 'Section not found on this report.');

  let revised: unknown;
  try {
    revised = await regenerateSection(patient, section, current.data, instruction);
  } catch (err) {
    console.error('[reports/[id]/regenerate POST] regenerateSection failed:', err);
    return jsonError(502, `Gemini generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  current.data = revised;
  current.version = (current.version || 1) + 1;
  current.lastPrompt = instruction;
  report.markModified('sections');

  await report.save();

  return Response.json({ report: serializeReport(report) });
}
