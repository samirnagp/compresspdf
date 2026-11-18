import Link from 'next/link';
import { pages } from '@/lib/tools';

export default function Home() {
  return (
    <>
      <h1>Compress PDFs and convert images to JPEG</h1>
      <p className="lead">Pick the size your form or portal asks for.</p>
      <h2>Compress PDF</h2>
      <ul className="links">{pages.filter((p) => p.kind === 'pdf').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.title}</Link></li>)}</ul>
      <h2>Convert image to JPEG</h2>
      <ul className="links">{pages.filter((p) => p.kind === 'image').map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.title}</Link></li>)}</ul>
    </>
  );
}
