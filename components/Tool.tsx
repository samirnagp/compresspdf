'use client';
import { useState } from 'react';
import { SIZES, type Kind } from '@/lib/tools';
import { CLIENT_MAX_BYTES, compressImageLocal, compressPdfLocal, type Local } from '@/lib/client';

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
type Result = { url: string; bytes: number; fit: boolean; via: 'browser' | 'server' };

export default function Tool({ kind, size: initial }: { kind: Kind; size: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [offerUpload, setOfferUpload] = useState(false);
  const isPdf = kind === 'pdf';

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
        setNotice('This file is large, so it needs to be uploaded to process. It is deleted right after.');
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

  return (
    <section className="tool">
      <label className="drop">
        <input type="file" accept={isPdf ? 'application/pdf' : 'image/*'}
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(''); setNotice(''); setOfferUpload(false); }} />
        {file ? <strong>{file.name} ({kb(file.size)})</strong> : <span>{isPdf ? 'Choose a PDF' : 'Choose an image'} or drop it here</span>}
      </label>
      <div className="row">
        <label>Target size
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {SIZES.map((s) => <option key={s} value={s}>{s} KB</option>)}
          </select>
        </label>
        <button onClick={() => run()} disabled={!file || busy}>{busy ? 'Working…' : isPdf ? 'Compress PDF' : 'Convert to JPEG'}</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p>{notice}</p>}
      {result && (
        <div className="result">
          <p>
            {result.fit ? `Done: ${kb(result.bytes)}.` : `Smallest possible here is ${kb(result.bytes)}, over your ${size} KB target.`}{' '}
            {result.via === 'browser' ? 'Processed in your browser. Nothing was uploaded.' : 'Processed on the server and deleted.'}
          </p>
          <a className="btn" href={result.url} download={outName}>Download</a>
        </div>
      )}
      {offerUpload && (
        <p><button onClick={() => run(true)} disabled={busy}>
          {result ? 'Try better compression (uploads file)' : 'Upload and compress'}
        </button></p>
      )}
    </section>
  );
}
