import Link from 'next/link';
import Home from '@/components/Home';
import AdSlot from '@/components/AdSlot';
import { HomeGuide } from '@/components/Guide';
import { pages } from '@/lib/tools';
import { guides } from '@/lib/guides';

export default function Page() {
  const group = (kind: 'pdf' | 'image') => pages.filter((p) => p.kind === kind);
  return (
    <>
      <h1>Get your file under the size limit</h1>
      <p className="lead">Compress a PDF, or turn any image into a JPEG, at 10, 50, 100 or 200 KB. Small files never leave your browser.</p>
      <Home />
      <AdSlot />
      <h2>Need an exact size?</h2>
      <div className="size-groups">
        <div><h3>Compress PDF</h3><ul className="links">{group('pdf').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.size} KB</Link></li>)}</ul></div>
        <div><h3>Image to JPEG</h3><ul className="links">{group('image').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.size} KB</Link></li>)}</ul></div>
        <div><h3>More tools</h3><ul className="links"><li><Link href="/compress-to-custom-size">Custom size</Link></li><li><Link href="/convert-image-to-jpeg">Convert to JPEG</Link></li></ul></div>
      </div>
      <h2>Guides</h2>
      <div className="cards">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card"><strong>{g.title}</strong><span>{g.description}</span></Link>
        ))}
      </div>
      <HomeGuide />
    </>
  );
}
