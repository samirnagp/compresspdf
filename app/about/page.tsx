import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'About', alternates: { canonical: '/about' } };

export default function About() {
  return (
    <>
      <h1>About EasyPDF</h1>
      <p className="lead">A free tool for getting files under the size limit.</p>
      <div className="logo-plate"><img src="/logo.png" alt="EasyPDF and Image Compressor logo" /></div>
      <p>Exam forms, college applications and government portals often reject files that are too large or in the wrong format. EasyPDF compresses PDFs and converts PNG, WebP, BMP, GIF and other images to JPEG at 10 KB, 50 KB, 100 KB or 200 KB.</p>
      <h2>How your files are handled</h2>
      <p>Small files are processed inside your browser, so nothing is uploaded. If a file is large, or the browser result is still over your target, you can choose to upload it for stronger compression. Uploaded files are processed and deleted right away.</p>
      <p>There are no accounts, and we do not store your files.</p>
    </>
  );
}
