import type { Metadata } from 'next';
import { CONTACT_EMAIL, LAST_UPDATED } from '@/lib/site';
export const metadata: Metadata = { title: 'Terms of Service', alternates: { canonical: '/terms' } };

export default function Terms() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: {LAST_UPDATED}</p>
      <h2>Using EasyPDF</h2>
      <p>EasyPDF is free to use. By using it, you agree to these terms. Only process files you have the right to use, and do not upload anything unlawful or harmful.</p>
      <h2>Limits</h2>
      <p>We limit upload size and request frequency to keep the service available for everyone. Do not try to overload, probe or bypass these limits.</p>
      <h2>Results</h2>
      <p>Compression reduces quality. Check the output before you submit it anywhere. Converting a PDF in the browser turns pages into images, so text may no longer be selectable. We cannot guarantee that a file will reach your exact target size.</p>
      <h2>No warranty</h2>
      <p>EasyPDF is provided "as is" and "as available", without warranties of any kind. To the extent the law allows, we are not liable for losses that result from using the service, including lost or damaged files. Keep a copy of your originals.</p>
      <h2>Changes</h2>
      <p>We may change the service or these terms. Continued use after a change means you accept the new terms.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </>
  );
}
