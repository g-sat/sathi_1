import type {
    DailyLogDTO,
    InterventionReportDTO,
    NudgeDTO,
    PatientProfileDTO,
    ReportSectionKey,
    UserDTO,
} from "@/types";

type Role = "chw" | "patient";

let authToken: string | null = null;

/** Called by SessionContext whenever the signed-in session changes so every
 * subsequent request automatically carries the right Authorization header. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

class ApiError extends Error {
  status: number;
  payload: Record<string, unknown>;
  constructor(
    status: number,
    message: string,
    payload: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(path, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body as any)?.error || `Request failed (${res.status})`,
      body,
    );
  }
  return body as T;
}

export const api = {
  // -- Auth -------------------------------------------------------------
  registerChw: (name: string, email: string, password: string) =>
    request<{ email: string; devCode?: string }>("/api/auth/chw/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  registerPatient: (patientId: string, email: string, password: string) =>
    request<{ email: string; devCode?: string }>("/api/auth/patient/register", {
      method: "POST",
      body: JSON.stringify({ patientId, email, password }),
    }),

  login: (role: Role, email: string, password: string) =>
    request<{
      token: string;
      user?: UserDTO;
      patient?: PatientProfileDTO | null;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ role, email, password }),
    }),

  verifyEmail: (role: Role, email: string, code: string) =>
    request<{
      token: string;
      user?: UserDTO;
      patient?: PatientProfileDTO | null;
    }>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ role, email, code }),
    }),

  resendCode: (role: Role, email: string) =>
    request<{ ok: true; devCode?: string }>("/api/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ role, email }),
    }),

  requestPasswordReset: (role: Role, email: string) =>
    request<{ ok: true; devCode?: string }>("/api/auth/request-reset", {
      method: "POST",
      body: JSON.stringify({ role, email }),
    }),

  resetPassword: (
    role: Role,
    email: string,
    code: string,
    newPassword: string,
  ) =>
    request<{ ok: true }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ role, email, code, newPassword }),
    }),

  // -- Patients -----------------------------------------------------------
  listPatients: () =>
    request<{ patients: (PatientProfileDTO & { reportStatus: string })[] }>(
      "/api/patients",
    ),

  getPatient: (id: string) =>
    request<{ patient: PatientProfileDTO }>(`/api/patients/${id}`),

  createPatient: (payload: Record<string, unknown>) =>
    request<{ patient: PatientProfileDTO }>("/api/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getReport: (patientId: string, status?: "draft" | "published") =>
    request<{ report: InterventionReportDTO | null }>(
      `/api/reports?patientId=${encodeURIComponent(patientId)}${status ? `&status=${status}` : ""}`,
    ),

  generateReport: (patientId: string) =>
    request<{ report: InterventionReportDTO }>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ patientId }),
    }),

  publishReport: (reportId: string) =>
    request<{ report: InterventionReportDTO }>(`/api/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "publish" }),
    }),

  regenerateSection: (
    reportId: string,
    section: ReportSectionKey,
    instruction: string,
  ) =>
    request<{ report: InterventionReportDTO }>(
      `/api/reports/${reportId}/regenerate`,
      {
        method: "POST",
        body: JSON.stringify({ section, instruction }),
      },
    ),

  listLogsForPatient: (patientId: string) =>
    request<{ logs: DailyLogDTO[] }>(
      `/api/logs?patientId=${encodeURIComponent(patientId)}`,
    ),

  listLogsForChw: () =>
    request<{ rows: { log: DailyLogDTO; patient: PatientProfileDTO }[] }>(
      "/api/logs?chwId=me",
    ),

  submitLog: (payload: Record<string, unknown>) =>
    request<{ log: DailyLogDTO }>("/api/logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getNudge: (patientId: string) =>
    request<{ nudge: NudgeDTO }>(
      `/api/nudges?patientId=${encodeURIComponent(patientId)}`,
    ),
};

export { ApiError };
