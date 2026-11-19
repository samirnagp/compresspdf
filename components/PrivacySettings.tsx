'use client';
import { ADSENSE_CLIENT } from '@/lib/site';

type FC = { callbackQueue?: Array<Record<string, () => void>>; showRevocationMessage?: () => void };

export default function PrivacySettings() {
  if (!ADSENSE_CLIENT) return null;
  const open = () => {
    const w = window as unknown as { googlefc?: FC };
    w.googlefc = w.googlefc || {};
    w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
    w.googlefc.callbackQueue.push({ CONSENT_DATA_READY: () => w.googlefc?.showRevocationMessage?.() });
  };
  return <button type="button" className="linkbtn" onClick={open}>Privacy settings</button>;
}
