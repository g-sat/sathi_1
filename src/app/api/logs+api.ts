import { connectDB } from '@/server/db';
import { PatientProfile } from '@/server/models/PatientProfile';
import { DailyLog } from '@/server/models/DailyLog';
import { serializeLog, serializePatient } from '@/server/serialize';
import { jsonError, safeJson, todayISODate } from '@/server/http';
import { withSession } from '@/server/auth';

// GET /api/logs?patientId=...              -> log history for one patient
//                                              (that patient themself, or
//                                              the CHW who owns them)
// GET /api/logs?chwId=... (ignored — always the signed-in CHW's own feed)
//                                           -> remote monitoring feed: the
//                                              most recent logs per patient
//                                              across a CHW's caseload
export async function GET(request: Request) {
  await connectDB();
  const { session, error: authError } = withSession(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const patientId = url.searchParams.get('patientId');
  const wantsChwFeed = url.searchParams.has('chwId');

  if (patientId) {
    const patient = await PatientProfile.findById(patientId).lean();
    if (!patient) return jsonError(404, 'Patient not found.');
    const isOwnerChw = session.role === 'chw' && String(patient.chwId) === session.sub;
    const isOwnPatient = session.role === 'patient' && session.patientProfileId === String(patient._id);
    if (!isOwnerChw && !isOwnPatient) return jsonError(403, 'You are not authorized to view these logs.');

    const logs = await DailyLog.find({ patientId }).sort({ date: -1 }).limit(60).lean();
    return Response.json({ logs: logs.map(serializeLog) });
  }

  if (wantsChwFeed) {
    if (session.role !== 'chw') return jsonError(403, 'Only CHWs can view the monitoring feed.');
    const chwId = session.sub;
    const patients = await PatientProfile.find({ chwId }).lean();
    const patientIds = patients.map((p) => p._id);
    const logs = await DailyLog.find({ patientId: { $in: patientIds } })
      .sort({ date: -1 })
      .limit(200)
      .lean();

    const patientById = new Map(patients.map((p) => [String(p._id), p]));
    const rows = logs.map((log) => ({
      log: serializeLog(log),
      patient: serializePatient(patientById.get(String(log.patientId))),
    }));

    return Response.json({ rows });
  }

  return jsonError(400, 'Provide either patientId or chwId.');
}

// POST /api/logs — a signed-in patient submits (or updates) today's log. One
// log per patient per calendar day.
export async function POST(request: Request) {
  await connectDB();
  const { session, error: authError } = withSession(request, 'patient');
  if (authError) return authError;

  const body = await safeJson(request);
  const patientId = String(body.patientId || session.patientProfileId || '');
  if (!patientId) return jsonError(400, 'patientId is required.');
  if (patientId !== session.patientProfileId) {
    return jsonError(403, 'You can only submit logs for your own account.');
  }

  const date = String(body.date || todayISODate());

  const log = await DailyLog.findOneAndUpdate(
    { patientId, date },
    {
      patientId,
      date,
      glucoseLevel: body.glucoseLevel != null ? Number(body.glucoseLevel) : undefined,
      glucoseTiming: body.glucoseTiming || undefined,
      meals: Array.isArray(body.meals) ? body.meals : [],
      activityMinutes: body.activityMinutes != null ? Number(body.activityMinutes) : undefined,
      activityType: body.activityType || undefined,
      moodNote: body.moodNote || undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return Response.json({ log: serializeLog(log) }, { status: 201 });
}
