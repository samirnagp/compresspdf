import type { Metadata } from 'next';
import { CONTACT_EMAIL, LAST_UPDATED } from '@/lib/site';
export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };

export default function Privacy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: {LAST_UPDATED}</p>
      <h2>Your files</h2>
      <p>Files up to 5 MB are compressed or converted in your browser. They are not sent to us.</p>
      <p>If you click "Upload and compress" or "Try better compression", the file is sent to our server over HTTPS, processed, and returned to you. We do not keep a copy. PDFs are written to temporary storage while they are processed and deleted immediately afterward. Images are processed in memory.</p>
      <h2>Information we collect</h2>
      <p>We do not ask you to create an account and we do not collect names, emails or other personal details through the tool. Our hosting provider and server may record standard request data, such as IP address, time and page requested, for security, abuse prevention and rate limiting. We do not use this data to identify you.</p>
      <h2>Cookies and analytics</h2>
      <p>The tool itself does not set cookies. If we add analytics or advertising, we will list the provider here and update this page.</p>
      <h2>Children</h2>
      <p>EasyPDF is not directed at children under 13, and we do not knowingly collect their personal information.</p>
      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows when it last changed.</p>
      <h2>Contact</h2>
      <p>Questions about privacy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </>
  );
}
