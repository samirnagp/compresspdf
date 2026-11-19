import sharp from 'sharp';
import { allow, clientIp } from '@/lib/limit';
import { MAX_UPLOAD_MB } from '@/lib/tools';

export const runtime = 'nodejs';

async function encode(input: Buffer, scale: number, quality: number) {
  const meta = await sharp(input).metadata();
  const width = Math.max(16, Math.round((meta.width ?? 800) * scale));
  return sharp(input).rotate().resize({ width }).flatten({ background: '#ffffff' })
    .jpeg({ quality, mozjpeg: true }).toBuffer();
}

export async function POST(req: Request) {
  if (!allow(clientIp(req))) return Response.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  const form = await req.formData();
  const file = form.get('file');
  const convertOnly = form.get('mode') === 'convert';
  const target = Number(form.get('target')) * 1024;
  if (!(file instanceof File)) return Response.json({ error: 'Choose an image first.' }, { status: 400 });
  if (!convertOnly && !(target >= 5 * 1024 && target <= 5120 * 1024)) return Response.json({ error: 'Enter a size between 5 and 5120 KB.' }, { status: 400 });
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return Response.json({ error: `File is over ${MAX_UPLOAD_MB}MB.` }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  try {
    if (convertOnly) {
      const out = await sharp(input).rotate().flatten({ background: '#ffffff' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      return new Response(out, { headers: { 'Content-Type': 'image/jpeg', 'X-Fit': '1' } });
    }
    let best: Buffer | null = null;
    for (const scale of [1, 0.8, 0.6, 0.45, 0.3, 0.2]) {
      let lo = 5, hi = 90, fit: Buffer | null = null;
      for (let i = 0; i < 6; i++) {
        const q = Math.round((lo + hi) / 2);
        const out = await encode(input, scale, q);
        best = !best || out.length < best.length ? out : best;
        if (out.length <= target) { fit = out; lo = q + 1; } else hi = q - 1;
      }
      if (fit) return new Response(fit, { headers: { 'Content-Type': 'image/jpeg', 'X-Fit': '1' } });
    }
    return new Response(best!, { headers: { 'Content-Type': 'image/jpeg', 'X-Fit': '0' } });
  } catch {
    return Response.json({ error: 'Could not read that image.' }, { status: 422 });
  }
}
