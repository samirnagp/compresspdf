import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/lib/site';
export const metadata: Metadata = { title: 'Contact', alternates: { canonical: '/contact' } };

export default function Contact() {
  return (
    <>
      <h1>Contact us</h1>
      <p className="lead">Found a bug or have a request? Email us.</p>
      <p><a className="btn" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      <p>If a file will not compress, tell us the file type, its size and the target size you chose. Please do not email files that contain private information.</p>
    </>
  );
}
