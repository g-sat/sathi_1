import { connectDB } from '@/server/db';
import { PatientProfile } from '@/server/models/PatientProfile';
import { serializePatient } from '@/server/serialize';
import { jsonError } from '@/server/http';
import { withSession } from '@/server/auth';

export async function GET(request: Request, { id }: Record<string, string>) {
  await connectDB();
  const { session, error } = withSession(request);
  if (error) return error;

  const patient = await PatientProfile.findById(id).lean();
  if (!patient) return jsonError(404, 'Patient not found.');

  if (String(patient.chwId) !== session.sub) return jsonError(403, 'You are not authorized to view this patient.');

  return Response.json({ patient: serializePatient(patient) });
}
