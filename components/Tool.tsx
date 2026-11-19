'use client';
import { useState } from 'react';
import { SIZES, type Kind } from '@/lib/tools';
import { CLIENT_MAX_BYTES, compressImageLocal, compressPdfLocal, type Local } from '@/lib/client';

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`);
type Result = { url: string; bytes: number; fit: boolean; via: 'browser' | 'server' };

export default function Tool({ kind, size: initial }: { kind: Kind; size: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [offerUpload, setOfferUpload] = useState(false);
  const isPdf = kind === 'pdf';

  const pick = (f: File | null) => { setFile(f); setResult(null); setError(''); setNotice(''); setOfferUpload(false); };
  const show = (blob: Blob, fit: boolean, via: Result['via']) =>
    setResult({ url: URL.createObjectURL(blob), bytes: blob.size, fit, via });

  async function viaServer(f: File) {
    const body = new FormData();
    body.append('file', f);
    body.append('target', String(size));
    const res = await fetch(isPdf ? '/api/compress-pdf' : '/api/convert-image', { method: 'POST', body });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Something went wrong.');
    show(await res.blob(), res.headers.get('X-Fit') === '1', 'server');
  }

  async function run(forceServer = false) {
    if (!file) return;
    setBusy(true); setError(''); setNotice(''); setResult(null); setOfferUpload(false);
    try {
      if (forceServer) { await viaServer(file); return; }
      if (file.size > CLIENT_MAX_BYTES) {
        setNotice('This file is large, so it has to be uploaded to process. It is deleted right after.');
        setOfferUpload(true); return;
      }
      let local: Local | null = null;
      try { local = isPdf ? await compressPdfLocal(file, size * 1024) : await compressImageLocal(file, size * 1024); }
      catch { local = null; }
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

  return (
    <section className="tool" aria-label={isPdf ? 'PDF compressor' : 'Image to JPEG converter'}>
      <label className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0] ?? null); }}>
        <input type="file" accept={isPdf ? 'application/pdf' : 'image/*'} onChange={(e) => pick(e.target.files?.[0] ?? null)} />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        {file
          ? <><span className="name">{file.name}</span><span className="hint">{kb(file.size)}. Click to choose another file.</span></>
          : <><strong>{isPdf ? 'Choose a PDF' : 'Choose an image'}</strong><span className="hint">or drop it here</span></>}
      </label>

      <span className="label" id="size-label">Target size</span>
      <div className="chips" role="radiogroup" aria-labelledby="size-label">
        {SIZES.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={size === s} className="chip" onClick={() => setSize(s)}>{s} KB</button>
        ))}
      </div>

      <div className="actions">
        <button className="btn" onClick={() => run()} disabled={!file || busy}>
          {busy ? 'Working…' : isPdf ? 'Compress PDF' : 'Convert to JPEG'}
        </button>
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
            {result.fit ? `Under your ${size} KB target. ` : `This is the smallest we could make it, and it is over your ${size} KB target. `}
            {result.via === 'browser' ? 'Processed in your browser. Nothing was uploaded.' : 'Processed on the server and deleted.'}
          </p>
          <a className="btn" href={result.url} download={outName}>Download {isPdf ? 'PDF' : 'JPEG'}</a>
        </div>
      )}
      {offerUpload && (
        <div className="actions">
          <button className="btn ghost" onClick={() => run(true)} disabled={busy}>
            {result ? 'Try stronger compression (uploads file)' : 'Upload and compress'}
          </button>
        </div>
      )}
    </section>
  );
}
