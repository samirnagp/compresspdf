import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.easypdf.website'),
  title: { default: 'EasyPDF: Compress PDF & Convert Images to JPEG', template: '%s | EasyPDF' },
  description: 'Compress PDFs and convert PNG, WebP or BMP images to JPEG under 10KB, 50KB, 100KB or 200KB.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <header>
        <Link className="brand" href="/">EasyPDF</Link>
        <nav><Link href="/compress-pdf-to-100kb">Compress PDF</Link><Link href="/image-to-jpeg-100kb">Image to JPEG</Link></nav>
      </header>
      <main>{children}</main>
      <footer>
        <nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></nav>
        <p>© {new Date().getFullYear()} EasyPDF. Small files are processed in your browser. Larger ones are uploaded only if you choose, and deleted right after.</p>
      </footer>
    </body></html>
  );
}
