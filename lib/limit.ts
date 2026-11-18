// Simple in-memory rate limit: N requests per minute per IP (resets on restart).
const hits = new Map<string, number[]>();
export function allow(ip: string, max = 20): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length <= max;
}
export const clientIp = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
