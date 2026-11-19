import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Montserrat } from 'next/font/google';
import PrivacySettings from '@/components/PrivacySettings';
import { ADSENSE_CLIENT } from '@/lib/site';
import './globals.css';

const display = Montserrat({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.easypdf.website'),
  title: { default: 'EasyPDF: Compress PDF & Convert Images to JPEG', template: '%s | EasyPDF' },
  description: 'Compress PDFs and convert PNG, WebP or BMP images to JPEG under 10KB, 50KB, 100KB or 200KB.',
  openGraph: { images: ['/og.png'], siteName: 'EasyPDF', type: 'website' },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  ...(ADSENSE_CLIENT ? { other: { 'google-adsense-account': ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body>
        {ADSENSE_CLIENT && (
          <Script async strategy="afterInteractive" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} />
        )}
        <header className="wrap site-header">
          <Link className="brand" href="/" aria-label="EasyPDF home">
            <Image src="/glyph.png" alt="" width={36} height={36} priority style={{ width: 'auto', height: 36 }} />
            <span>Easy<b>PDF</b></span>
          </Link>
          <nav aria-label="Main">
            <Link href="/compress-pdf-to-100kb">PDF</Link>
            <Link href="/image-to-jpeg-100kb">Image</Link>
            <Link href="/guides">Guides</Link>
          </nav>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap site-footer">
          <nav aria-label="Footer">
            <Link href="/guides">Guides</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link><PrivacySettings />
          </nav>
          <p>© {new Date().getFullYear()} EasyPDF. Small files are processed in your browser. Larger ones are uploaded only if you choose, and deleted right after.</p>
        </footer>
      </body>
    </html>
  );
}
