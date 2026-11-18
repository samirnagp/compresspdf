export type Kind = 'pdf' | 'image';
export const SIZES = [10, 50, 100, 200];
export const MAX_UPLOAD_MB = 20;

export type ToolPage = { slug: string; kind: Kind; size: number; title: string; description: string };

export const pages: ToolPage[] = SIZES.flatMap((size) => [
  {
    slug: `compress-pdf-to-${size}kb`, kind: 'pdf' as Kind, size,
    title: `Compress PDF to ${size}KB`,
    description: `Reduce a PDF to under ${size}KB for exam forms and online portals.`,
  },
  {
    slug: `image-to-jpeg-${size}kb`, kind: 'image' as Kind, size,
    title: `Convert Image to JPEG under ${size}KB`,
    description: `Turn PNG, WebP, BMP or GIF into a JPEG under ${size}KB.`,
  },
]);

export const getPage = (slug: string) => pages.find((p) => p.slug === slug);
