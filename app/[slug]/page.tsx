import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Tool from '@/components/Tool';
import { getPage, pages } from '@/lib/tools';

export const dynamicParams = false;
export const generateStaticParams = () => pages.map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getPage(params.slug);
  return page ? { title: page.title, description: page.description, alternates: { canonical: `/${page.slug}` } } : {};
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const page = getPage(params.slug);
  if (!page) notFound();
  const related = pages.filter((p) => p.kind === page.kind && p.slug !== page.slug);
  return (
    <>
      <h1>{page.title}</h1>
      <p className="lead">{page.description}</p>
      <Tool kind={page.kind} size={page.size} />
      <h2>Other sizes</h2>
      <ul className="links">{related.map((p) => <li key={p.slug}><Link href={`/${p.slug}`}>{p.title}</Link></li>)}</ul>
    </>
  );
}
