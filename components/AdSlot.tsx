'use client';
import { useEffect } from 'react';
import { ADSENSE_CLIENT, ADSENSE_SLOT } from '@/lib/site';

export default function AdSlot() {
  const on = Boolean(ADSENSE_CLIENT && ADSENSE_SLOT);
  useEffect(() => {
    if (!on) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch { /* ad blocked or already filled */ }
  }, [on]);
  if (!on) return null;
  return (
    <aside className="ad" aria-label="Advertisement">
      <p className="ad-label">Advertisement</p>
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
