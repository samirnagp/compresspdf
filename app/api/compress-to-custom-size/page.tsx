import type { Metadata } from 'next';
import Link from 'next/link';
import Tool from '@/components/Tool';
import AdSlot from '@/components/AdSlot';
import { Faq } from '@/components/Guide';
import { customFaq } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Compress PDF or Image to a Custom Size',
  description: 'Compress a PDF or convert an image to JPEG at any size you type, from 5 KB to 5 MB. Free, no account.',
  alternates: { canonical: '/compress-to-custom-size' },
};

export default function Page() {
  return (
    <>
      <h1>Compress a PDF or image to a custom size</h1>
      <p className="lead">Type the exact limit your form asks for, from 5 KB to 5 MB.</p>
      <Tool kind="any" size={100} sizing="custom" />
      <AdSlot />
      <Faq title="Questions about custom sizes" items={customFaq} />
      <h2>Standard sizes</h2>
      <ul className="links">
        <li><Link href="/compress-pdf-to-100kb">PDF 100 KB</Link></li>
        <li><Link href="/image-to-jpeg-100kb">JPEG 100 KB</Link></li>
        <li><Link href="/convert-image-to-jpeg">Convert to JPEG</Link></li>
      </ul>
    </>
  );
}
