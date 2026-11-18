import Link from 'next/link';
import Home from '@/components/Home';
import { pages } from '@/lib/tools';

export default function Page() {
  const group = (kind: 'pdf' | 'image') => pages.filter((p) => p.kind === kind);
  return (
    <>
      <h1>Get your file under the size limit</h1>
      <p className="lead">Compress a PDF, or turn any image into a JPEG, at 10, 50, 100 or 200 KB. Small files never leave your browser.</p>
      <Home />
      <h2>Need an exact size?</h2>
      <div className="size-groups">
        <div><h3>Compress PDF</h3><ul className="links">{group('pdf').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.size} KB</Link></li>)}</ul></div>
        <div><h3>Image to JPEG</h3><ul className="links">{group('image').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.size} KB</Link></li>)}</ul></div>
      </div>
    </>
  );
}
