import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { allow, clientIp } from '@/lib/limit';
import { MAX_UPLOAD_MB } from '@/lib/tools';

export const runtime = 'nodejs';
const run = promisify(execFile);

export async function POST(req: Request) {
  if (!allow(clientIp(req), 10)) return Response.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  const form = await req.formData();
  const file = form.get('file');
  const target = Number(form.get('target')) * 1024;
  if (!(file instanceof File) || !(target >= 5 * 1024 && target <= 5120 * 1024)) return Response.json({ error: 'Choose a PDF and a target size.' }, { status: 400 });
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return Response.json({ error: `File is over ${MAX_UPLOAD_MB}MB.` }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  if (input.subarray(0, 5).toString() !== '%PDF-') return Response.json({ error: 'That file is not a PDF.' }, { status: 422 });

  const dir = await mkdtemp(path.join(tmpdir(), 'pdf-'));
  try {
    const inPath = path.join(dir, 'in.pdf');
    await writeFile(inPath, input);
    let best: Buffer | null = null;
    for (const dpi of [150, 100, 72, 50, 36]) {
      const outPath = path.join(dir, `out-${dpi}.pdf`);
      await run('gs', [
        '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dNOPAUSE', '-dQUIET', '-dBATCH', '-dSAFER',
        '-dDownsampleColorImages=true', `-dColorImageResolution=${dpi}`,
        '-dDownsampleGrayImages=true', `-dGrayImageResolution=${dpi}`,
        '-dDownsampleMonoImages=true', `-dMonoImageResolution=${dpi}`,
        `-sOutputFile=${outPath}`, inPath,
      ], { timeout: 60_000 });
      const out = await readFile(outPath);
      best = !best || out.length < best.length ? out : best;
      if (out.length <= target) return new Response(out, { headers: { 'Content-Type': 'application/pdf', 'X-Fit': '1' } });
    }
    return new Response(best!, { headers: { 'Content-Type': 'application/pdf', 'X-Fit': '0' } });
  } catch {
    return Response.json({ error: 'Could not compress that PDF.' }, { status: 422 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
