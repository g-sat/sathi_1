import { connectDB } from '@/server/db';
import { PatientProfile } from '@/server/models/PatientProfile';
import { Nudge } from '@/server/models/Nudge';
import { generateDailyNudge } from '@/server/gemini';
import { serializeNudge } from '@/server/serialize';
import { jsonError, todayISODate } from '@/server/http';
import { withSession } from '@/server/auth';

// GET /api/nudges?patientId=... — returns today's nudge for the signed-in
// patient (or their CHW), generating and caching one (via Gemini, translated
// into the patient's local language) if it doesn't exist yet.
export async function GET(request: Request) {
  await connectDB();
  const { session, error: authError } = withSession(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');
  if (!patientId) return jsonError(400, 'patientId query parameter is required.');

  const patient = await PatientProfile.findById(patientId);
  if (!patient) return jsonError(404, 'Patient not found.');

  const isOwnerChw = session.role === 'chw' && String(patient.chwId) === session.sub;
  const isOwnPatient = session.role === 'patient' && session.patientProfileId === String(patient._id);
  if (!isOwnerChw && !isOwnPatient) return jsonError(403, 'You are not authorized to view this nudge.');

  const date = todayISODate();

  let nudge = await Nudge.findOne({ patientId, date });
  if (!nudge) {
    let generated;
    try {
      generated = await generateDailyNudge(patient);
    } catch (err) {
      console.error('[nudges GET] generateDailyNudge failed:', err);
      return jsonError(502, `Gemini generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    nudge = await Nudge.create({
      patientId,
      date,
      language: patient.localLanguage,
      message: generated.english,
      translatedMessage: generated.translated,
    });
  }

  return Response.json({ nudge: serializeNudge(nudge) });
}
