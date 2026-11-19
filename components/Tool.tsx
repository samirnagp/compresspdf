'use client';
import { useState } from 'react';
import { SIZES, type Kind } from '@/lib/tools';
import { CLIENT_MAX_BYTES, compressImageLocal, compressPdfLocal, convertToJpegLocal, type Local } from '@/lib/client';

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`);
type Result = { url: string; bytes: number; fit: boolean; via: 'browser' | 'server' };
type Sizing = 'preset' | 'custom' | 'none';
const MIN_KB = 5;
const MAX_KB = 5120;
const isPdfFile = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
const isImageFile = (f: File) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg|avif|heic|heif)$/i.test(f.name);

export default function Tool({ kind, size: initial, sizing = 'preset' }: { kind: Kind | 'any'; size: number; sizing?: Sizing }) {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState(initial);
  const [custom, setCustom] = useState(String(initial));
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [offerUpload, setOfferUpload] = useState(false);

  const eff: Kind = kind === 'any' ? (file && isPdfFile(file) ? 'pdf' : 'image') : kind;
  const isPdf = eff === 'pdf';
  const target = sizing === 'custom' ? Number(custom) : size;

  function check(f: File): string {
    if (kind === 'pdf' && !isPdfFile(f)) return 'Please choose a PDF file.';
    if (kind === 'image' && !isImageFile(f)) return 'Please choose an image file.';
    if (kind === 'any' && !isPdfFile(f) && !isImageFile(f)) return 'Please choose a PDF or an image.';
    return '';
  }

  function pick(f: File | null) {
    setResult(null); setNotice(''); setOfferUpload(false);
    if (f) {
      const problem = check(f);
      if (problem) { setFile(null); setError(problem); return; }
    }
    setFile(f); setError('');
  }

  const show = (blob: Blob, fit: boolean, via: Result['via']) =>
    setResult({ url: URL.createObjectURL(blob), bytes: blob.size, fit, via });

  async function viaServer(f: File) {
    const body = new FormData();
    body.append('file', f);
    if (sizing === 'none') body.append('mode', 'convert');
    else body.append('target', String(target));
    const res = await fetch(isPdf ? '/api/compress-pdf' : '/api/convert-image', { method: 'POST', body });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Something went wrong.');
    show(await res.blob(), res.headers.get('X-Fit') === '1', 'server');
  }

  async function run(forceServer = false) {
    if (!file) return;
    if (sizing !== 'none' && !(target >= MIN_KB && target <= MAX_KB)) {
      setError(`Enter a size between ${MIN_KB} and ${MAX_KB.toLocaleString('en-US')} KB.`);
      return;
    }
    setBusy(true); setError(''); setNotice(''); setResult(null); setOfferUpload(false);
    try {
      if (forceServer) { await viaServer(file); return; }
      if (file.size > CLIENT_MAX_BYTES) {
        setNotice('This file is large, so it has to be uploaded to process. It is deleted right after.');
        setOfferUpload(true); return;
      }
      let local: Local | null = null;
      try {
        if (sizing === 'none') local = await convertToJpegLocal(file);
        else local = isPdf ? await compressPdfLocal(file, target * 1024) : await compressImageLocal(file, target * 1024);
      } catch { local = null; }
      if (!local) {
        setNotice('Your browser could not process this file. You can upload it instead. It is deleted right after.');
        setOfferUpload(true); return;
      }
      show(local.blob, local.fit, 'browser');
      if (!local.fit) setOfferUpload(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Check your connection and try again.');
    } finally { setBusy(false); }
  }

  const outName = file ? file.name.replace(/\.[^.]+$/, '') + (isPdf ? '-compressed.pdf' : '.jpg') : '';
  const saved = file && result ? Math.round((1 - result.bytes / file.size) * 100) : 0;
  const action = sizing === 'none' ? 'Convert to JPEG' : !file && kind === 'any' ? 'Compress' : isPdf ? 'Compress PDF' : 'Convert to JPEG';
  const chooseText = kind === 'pdf' ? 'Choose a PDF' : kind === 'image' ? 'Choose an image' : 'Choose a PDF or image';
  const accept = kind === 'pdf' ? 'application/pdf' : kind === 'image' ? 'image/*' : 'application/pdf,image/*';

  return (
    <section className="tool" aria-label="File size tool">
      <label className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0] ?? null); }}>
        <input type="file" accept={accept} onChange={(e) => pick(e.target.files?.[0] ?? null)} />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        {file
          ? <><span className="name">{file.name}</span><span className="hint">{kb(file.size)}. Click to choose another file.</span></>
          : <><strong>{chooseText}</strong><span className="hint">or drop it here</span></>}
      </label>

      {sizing === 'preset' && (
        <>
          <span className="label" id="size-label">Target size</span>
          <div className="chips" role="radiogroup" aria-labelledby="size-label">
            {SIZES.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} className="chip" onClick={() => setSize(s)}>{s} KB</button>
            ))}
          </div>
        </>
      )}
      {sizing === 'custom' && (
        <>
          <label className="label" htmlFor="custom-size">Target size in KB</label>
          <input id="custom-size" className="num" type="number" inputMode="numeric" min={MIN_KB} max={MAX_KB}
            value={custom} onChange={(e) => setCustom(e.target.value)} />
          <p className="notice">Any size from {MIN_KB} to {MAX_KB.toLocaleString('en-US')} KB.</p>
        </>
      )}
      {sizing === 'none' && <p className="notice">Keeps the original dimensions and uses high JPEG quality.</p>}

      <div className="actions">
        <button className="btn" onClick={() => run()} disabled={!file || busy}>{busy ? 'Working…' : action}</button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      {result && (
        <div className="result" role="status">
          <p className="sizes">
            {file ? `${kb(file.size)} → ` : ''}<span className={result.fit ? 'ok' : ''}>{kb(result.bytes)}</span>
            {saved > 0 ? ` (${saved}% smaller)` : ''}
          </p>
          <p>
            {sizing === 'none'
              ? 'Converted to JPEG. '
              : result.fit ? `Under your ${target} KB target. ` : `This is the smallest we could make it, and it is over your ${target} KB target. `}
            {result.via === 'browser' ? 'Processed in your browser. Nothing was uploaded.' : 'Processed on the server and deleted.'}
          </p>
          <a className="btn" href={result.url} download={outName}>Download {isPdf ? 'PDF' : 'JPEG'}</a>
        </div>
      )}
      {offerUpload && (
        <div className="actions">
          <button className="btn ghost" onClick={() => run(true)} disabled={busy}>
            {result ? 'Try stronger compression (uploads file)' : 'Upload and process'}
          </button>
        </div>
      )}
    </section>
  );
}
