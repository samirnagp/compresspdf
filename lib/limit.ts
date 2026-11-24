import { MAX_UPLOAD_MB } from './tools';

// ---- Per-IP rate limit (in memory, resets on restart) ----
const hits = new Map<string, number[]>();
let lastSweep = Date.now();

export function allow(ip: string, max = 20): boolean {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [key, times] of hits) if (!times.some((t) => now - t < 60_000)) hits.delete(key);
    lastSweep = now;
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length <= max;
}

export function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

// ---- Shared request checks for the upload APIs ----
export function guard(req: Request, perMinute: number): Response | null {
  const origin = req.headers.get('origin');
  if (origin) {
    const hosts = [req.headers.get('host'), req.headers.get('x-forwarded-host')];
    let ok = false;
    try { ok = hosts.includes(new URL(origin).host); } catch { ok = false; }
    if (!ok) return Response.json({ error: 'Request not allowed.' }, { status: 403 });
  }
  const length = Number(req.headers.get('content-length'));
  if (length > (MAX_UPLOAD_MB + 1) * 1024 * 1024) {
    return Response.json({ error: `File is over ${MAX_UPLOAD_MB}MB.` }, { status: 413 });
  }
  if (!allow(clientIp(req), perMinute)) {
    return Response.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }
  return null;
}

// ---- Limit how many heavy jobs run at once, so one burst cannot exhaust memory or CPU ----
export function makeSlots(max: number) {
  let active = 0;
  return {
    acquire(): boolean { if (active >= max) return false; active += 1; return true; },
    release(): void { active = Math.max(0, active - 1); },
  };
}
