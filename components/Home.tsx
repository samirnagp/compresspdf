'use client';
import { useState } from 'react';
import Tool from './Tool';
import type { Kind } from '@/lib/tools';

type Tab = { id: string; label: string; desc: string; kind: Kind | 'any'; sizing: 'preset' | 'custom' | 'none' };

const TABS: Tab[] = [
  { id: 'pdf', label: 'Compress PDF', desc: 'Pick a standard size for your PDF.', kind: 'pdf', sizing: 'preset' },
  { id: 'image', label: 'JPEG by size', desc: 'Turn any image into a JPEG at a standard size.', kind: 'image', sizing: 'preset' },
  { id: 'custom', label: 'Custom size', desc: 'Type any size in KB. Works for PDFs and images.', kind: 'any', sizing: 'custom' },
  { id: 'convert', label: 'Convert to JPEG', desc: 'Convert any image to JPEG with no size limit.', kind: 'image', sizing: 'none' },
];

export default function Home() {
  const [id, setId] = useState('pdf');
  const tab = TABS.find((t) => t.id === id) ?? TABS[0];
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Choose a tool">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="tab" aria-selected={id === t.id} onClick={() => setId(t.id)}>{t.label}</button>
        ))}
      </div>
      <p className="tab-desc">{tab.desc}</p>
      <Tool key={tab.id} kind={tab.kind} sizing={tab.sizing} size={100} />
    </>
  );
}
