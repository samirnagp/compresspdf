import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Step-by-step guides for getting PDFs, photos and signatures under the size limits of online forms.',
  alternates: { canonical: '/guides' },
};

const GROUPS = ['PDF', 'Photos & images'] as const;

export default function Guides() {
  return (
    <>
      <h1>Guides</h1>
      <p className="lead">Practical help for getting files under the size limit of an online form.</p>
      {GROUPS.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          <div className="cards">
            {guides.filter((g) => g.group === group).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
                <strong>{g.title}</strong>
                <span>{g.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
