import type { Metadata } from 'next';
import Link from 'next/link';
import Tool from '@/components/Tool';
import AdSlot from '@/components/AdSlot';
import { Faq } from '@/components/Guide';
import { convertFaq } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Convert Any Image to JPEG',
  description: 'Convert PNG, WebP, GIF, BMP and other images to JPEG online. Free, no account, and small files never leave your browser.',
  alternates: { canonical: '/convert-image-to-jpeg' },
};

export default function Page() {
  return (
    <>
      <h1>Convert any image to JPEG</h1>
      <p className="lead">Turn PNG, WebP, GIF, BMP and more into a JPEG. No size limit to set.</p>
      <Tool kind="image" size={100} sizing="none" />
      <AdSlot />
      <Faq title="Questions about converting to JPEG" items={convertFaq} />
      <h2>Need a specific file size?</h2>
      <ul className="links">
        <li><Link href="/image-to-jpeg-50kb">JPEG under 50 KB</Link></li>
        <li><Link href="/image-to-jpeg-100kb">JPEG under 100 KB</Link></li>
        <li><Link href="/compress-to-custom-size">Custom size</Link></li>
      </ul>
    </>
  );
}
