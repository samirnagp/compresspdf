'use client';
import { useState } from 'react';
import Tool from './Tool';
import type { Kind } from '@/lib/tools';

const TABS: { kind: Kind; label: string }[] = [
  { kind: 'pdf', label: 'Compress PDF' },
  { kind: 'image', label: 'Image to JPEG' },
];

export default function Home() {
  const [kind, setKind] = useState<Kind>('pdf');
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Choose a tool">
        {TABS.map((t) => (
          <button key={t.kind} role="tab" className="tab" aria-selected={kind === t.kind} onClick={() => setKind(t.kind)}>{t.label}</button>
        ))}
      </div>
      <Tool key={kind} kind={kind} size={100} />
    </>
  );
}
