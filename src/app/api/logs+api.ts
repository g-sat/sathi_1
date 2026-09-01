import { connectDB } from '@/server/db';
import { PatientProfile } from '@/server/models/PatientProfile';
import { DailyLog } from '@/server/models/DailyLog';
import { serializeLog, serializePatient } from '@/server/serialize';
import { jsonError } from '@/server/http';
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
    if (!isOwnerChw) return jsonError(403, 'You are not authorized to view these logs.');

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

