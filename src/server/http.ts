export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function safeJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}
