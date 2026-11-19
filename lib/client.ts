// Browser-side compression. Files never leave the device.
export type Local = { blob: Blob; fit: boolean };
export const CLIENT_MAX_BYTES = 5 * 1024 * 1024;
const MAX_PDF_PAGES = 30;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
    img.src = url;
  });
}

const toJpeg = (c: HTMLCanvasElement, q: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), 'image/jpeg', q));

export async function compressImageLocal(file: File, targetBytes: number): Promise<Local> {
  const img = await loadImage(file);
  const w0 = img.naturalWidth || img.width || 800;
  const h0 = img.naturalHeight || img.height || 600;
  let best: Blob | null = null;
  for (const scale of [1, 0.8, 0.6, 0.45, 0.3, 0.2]) {
    const c = document.createElement('canvas');
    c.width = Math.max(16, Math.round(w0 * scale));
    c.height = Math.max(16, Math.round(h0 * scale));
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    let lo = 0.05, hi = 0.9, fit: Blob | null = null;
    for (let i = 0; i < 6; i++) {
      const q = (lo + hi) / 2;
      const out = await toJpeg(c, q);
      if (!best || out.size < best.size) best = out;
      if (out.size <= targetBytes) { fit = out; lo = q; } else hi = q;
    }
    if (fit) return { blob: fit, fit: true };
  }
  return { blob: best!, fit: false };
}

// Returns null when the PDF is too big for the browser path (caller offers upload).
export async function compressPdfLocal(file: File, targetBytes: number): Promise<Local | null> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
  const { jsPDF } = await import('jspdf');
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer(), isEvalSupported: false }).promise;
  if (doc.numPages > MAX_PDF_PAGES) return null;

  let best: Blob | null = null;
  for (const [scale, quality] of [[1.5, 0.7], [1, 0.6], [0.75, 0.5], [0.5, 0.4], [0.35, 0.3]]) {
    let pdf: InstanceType<typeof jsPDF> | null = null;
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale });
      const c = document.createElement('canvas');
      c.width = Math.round(vp.width);
      c.height = Math.round(vp.height);
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const orient = base.width > base.height ? 'l' : 'p';
      if (!pdf) pdf = new jsPDF({ unit: 'pt', format: [base.width, base.height], orientation: orient, compress: true });
      else pdf.addPage([base.width, base.height], orient);
      pdf.addImage(c.toDataURL('image/jpeg', quality), 'JPEG', 0, 0, base.width, base.height);
    }
    const out = pdf!.output('blob');
    if (!best || out.size < best.size) best = out;
    if (out.size <= targetBytes) return { blob: out, fit: true };
  }
  return { blob: best!, fit: false };
}

// Plain conversion to JPEG at high quality, keeping the original dimensions.
export async function convertToJpegLocal(file: File): Promise<Local> {
  const img = await loadImage(file);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width || 800;
  c.height = img.naturalHeight || img.height || 600;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return { blob: await toJpeg(c, 0.92), fit: true };
}
