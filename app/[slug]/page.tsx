import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getGuide, guides } from '@/lib/guides';

export const dynamicParams = false;
export const generateStaticParams = () => guides.map((g) => ({ slug: g.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  return g ? { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` } } : {};
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const related = guides.filter((x) => x.group === g.group && x.slug !== g.slug).slice(0, 3);
  return (
    <article>
      <p><Link href="/guides">← All guides</Link></p>
      <h1>{g.title}</h1>
      <p className="lead">{g.intro}</p>
      <p className="meta">Last updated {g.updated}</p>
      {g.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p?.map((t) => <p key={t}>{t}</p>)}
          {s.ul && <ul className="steps">{s.ul.map((t) => <li key={t}>{t}</li>)}</ul>}
          {s.ol && <ol className="steps">{s.ol.map((t) => <li key={t}>{t}</li>)}</ol>}
        </section>
      ))}
      <h2>Try the tools</h2>
      <ul className="links">{g.links.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
      <h2>Related guides</h2>
      <div className="cards">
        {related.map((r) => (
          <Link key={r.slug} href={`/guides/${r.slug}`} className="card"><strong>{r.title}</strong></Link>
        ))}
      </div>
    </article>
  );
}
