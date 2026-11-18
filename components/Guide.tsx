import { faq, howTo, homeFaq, tips, type QA } from '@/lib/content';
import type { Kind } from '@/lib/tools';

function Faq({ title, items }: { title: string; items: QA[] }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.map((it) => (
        <details key={it.q}><summary>{it.q}</summary><p>{it.a}</p></details>
      ))}
    </section>
  );
}

export function ToolGuide({ kind, size }: { kind: Kind; size: number }) {
  const h = howTo(kind, size);
  const t = tips(kind, size);
  const f = faq(kind, size);
  return (
    <>
      <section>
        <h2>{h.title}</h2>
        <ol className="steps">{h.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
      <section>
        <h2>{t.title}</h2>
        <ul className="steps">{t.items.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <Faq title={f.title} items={f.items} />
    </>
  );
}

export function HomeGuide() {
  return (
    <>
      <section>
        <h2>How it works</h2>
        <ol className="steps">
          <li>Choose a PDF or an image and pick the size your form allows.</li>
          <li>EasyPDF compresses it. Small files are processed in your browser, so nothing is uploaded.</li>
          <li>Download the result and check it before you submit.</li>
        </ol>
      </section>
      <Faq title="Frequently asked questions" items={homeFaq} />
    </>
  );
}
