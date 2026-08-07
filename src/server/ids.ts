import { randomInt } from 'node:crypto';

/** Generates a human-friendly Patient ID, e.g. "SATHI-4821". */
export function generatePatientId(): string {
  const n = randomInt(1000, 9999);
  return `SATHI-${n}`;
}

/** Generates a human-friendly CHW login code from their name, e.g. "chw-asha-2931". */
export function generateChwCode(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const n = randomInt(1000, 9999);
  return `chw-${slug || 'worker'}-${n}`;
}
