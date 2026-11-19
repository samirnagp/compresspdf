import type { Kind } from './tools';

export type QA = { q: string; a: string };

const SIZE_NOTE: Record<number, { pdf: string; image: string }> = {
  10: {
    pdf: '10 KB is extremely small. It usually only works for one or two pages, and text will look soft. If the form allows a bigger limit, use it.',
    image: '10 KB is extremely small. Crop tightly to what matters first, such as just a signature, so the limited bytes go to the part people will see. Expect visible softness.',
  },
  50: {
    pdf: '50 KB suits a single page, such as a short letter or a one-page certificate. Documents with photos or many pages rarely fit.',
    image: '50 KB works well for signatures and small passport-style photos. Cropping out empty background before you convert helps a lot.',
  },
  100: {
    pdf: '100 KB is a common limit on application forms. A clean one-page scan usually fits. Several pages at this size will look noticeably compressed.',
    image: '100 KB is a common limit on application forms. Most phone photos fit after cropping, with good quality for faces and text.',
  },
  200: {
    pdf: '200 KB leaves room for sharper text. A few pages scanned at modest resolution can fit. A long document may still be too large.',
    image: '200 KB keeps good detail for ID cards and documents photographed with a phone, with room to spare for faces.',
  },
};

export function howTo(kind: Kind, size: number): { title: string; steps: string[] } {
  if (kind === 'pdf') {
    return {
      title: `How to compress a PDF to ${size} KB`,
      steps: [
        'Choose your PDF, or drag it onto the upload box.',
        `Make sure ${size} KB is selected as the target size.`,
        'Select Compress PDF. Most files finish in a few seconds, and longer documents take more time.',
        'Check the result. If it is still over your limit, use the stronger compression option, or remove pages you do not need and try again.',
        'Download the file and open it once to confirm the text is readable before you submit it.',
      ],
    };
  }
  return {
    title: `How to convert an image to JPEG under ${size} KB`,
    steps: [
      'Choose your image, or drag it onto the upload box. PNG, WebP, GIF, BMP and JPEG files all work.',
      `Make sure ${size} KB is selected as the target size.`,
      'Select Convert to JPEG. The tool lowers quality and, if needed, reduces the image dimensions until it fits.',
      'Check the preview in the downloaded file. If it is too soft, crop the original to the part you need and convert again.',
      'Download the JPEG and use it in your form.',
    ],
  };
}

export function tips(kind: Kind, size: number): { title: string; items: string[] } {
  const note = SIZE_NOTE[size]?.[kind];
  const common = kind === 'pdf'
    ? [
        'Scanned pages shrink the most. A PDF made from typed text with embedded fonts is already small, and converting it can make it larger.',
        'Fewer pages means a smaller file. Remove blank or unneeded pages before you compress.',
        'Scan at 150 to 200 dpi in black and white or grayscale rather than color if the form allows it.',
      ]
    : [
        'Crop before you convert. Less empty area means more detail in the part that counts.',
        'Smaller dimensions mean a smaller file. A photo straight from a phone is far larger than any form needs.',
        'Plain backgrounds compress better than busy ones.',
      ];
  return { title: `Tips for getting under ${size} KB`, items: note ? [note, ...common] : common };
}

export function faq(kind: Kind, size: number): { title: string; items: QA[] } {
  const safe: QA = {
    q: kind === 'pdf' ? 'Is it safe to compress my PDF here?' : 'Is it safe to convert my image here?',
    a: 'Files up to 5 MB are processed inside your browser and never leave your device. If a file is larger, or your browser cannot process it, you can choose to upload it. Uploaded files are processed and deleted right away, and we do not keep copies. See the Privacy Policy for details.',
  };
  if (kind === 'pdf') {
    return {
      title: `Questions about compressing a PDF to ${size} KB`,
      items: [
        safe,
        { q: `Why is my PDF still over ${size} KB?`, a: `The tool reduces image resolution and quality as far as it reasonably can. A document with many pages, or very detailed pages, may not fit in ${size} KB. Try removing pages, splitting the document into parts, or choosing a larger size if the form allows it.` },
        { q: 'Will I still be able to select and copy the text?', a: 'In the browser version, no. Each page is turned into an image, so the text is no longer selectable and search will not work. The upload option can keep text in some cases. Keep your original file in case you need the text later.' },
        { q: `How many pages can fit in ${size} KB?`, a: `It depends on the content. A single clean page usually fits easily, while a long scanned document at ${size} KB will look heavily compressed or may not fit at all.` },
        { q: 'What is the largest file I can use?', a: 'In the browser, files up to 5 MB and 30 pages. If you choose to upload, the limit is 20 MB.' },
        { q: 'Does it cost anything, or do I need an account?', a: 'It is free and needs no account or sign-up.' },
      ],
    };
  }
  return {
    title: `Questions about converting an image to JPEG under ${size} KB`,
    items: [
      safe,
      { q: 'Which image formats can I convert?', a: 'Any format your browser can open, including PNG, WebP, GIF, BMP, SVG and JPEG. HEIC photos from some phones may not open in every browser. If yours does not, export it as JPEG or PNG from your phone first.' },
      { q: 'Why did the image get smaller in pixels as well?', a: `To get under ${size} KB, the tool lowers quality first and then reduces the dimensions in steps until the file fits. Very detailed images at a small size limit need both.` },
      { q: 'What happens to a transparent background?', a: 'JPEG cannot store transparency, so transparent areas are filled with white.' },
      { q: `Will the file be exactly ${size} KB?`, a: `The goal is the largest quality that stays under ${size} KB, so the result is usually a little below it. It is never intentionally above your limit.` },
      { q: `Why is the result still over ${size} KB?`, a: 'This happens when the limit is very small for the image. Crop it to the part you need, then convert again, or pick a larger size if your form allows.' },
    ],
  };
}

export const homeFaq: QA[] = [
  { q: 'What can EasyPDF do?', a: 'It compresses PDF files and converts images such as PNG, WebP, GIF and BMP into JPEG, aiming for a size you choose: 10, 50, 100 or 200 KB.' },
  { q: 'Which size should I pick?', a: 'Use the limit stated on the form or portal you are filling in. If no limit is shown, 100 KB is a common choice. Always pick the largest size the form allows, because it keeps more quality.' },
  { q: 'Are my files uploaded?', a: 'Files up to 5 MB are processed in your browser and never leave your device. Larger files are uploaded only if you choose to, and they are deleted right after processing.' },
  { q: 'Why can I not select text in my compressed PDF?', a: 'To reach small sizes, the browser version turns each page into an image. Keep your original if you need selectable text.' },
  { q: 'Does it cost anything?', a: 'No. It is free and needs no account.' },
];

const SAFE_QA: QA = {
  q: 'Are my files uploaded?',
  a: 'Files up to 5 MB are processed inside your browser and never leave your device. Larger files, or ones your browser cannot handle, are uploaded only if you choose, and are deleted right after processing.',
};

export const customFaq: QA[] = [
  { q: 'What sizes can I enter?', a: 'Any size from 5 KB to 5,120 KB (5 MB). Very small targets may not be reachable for large or detailed files.' },
  { q: 'Does it work for both PDFs and images?', a: 'Yes. Choose a PDF to compress it, or an image to convert it to a JPEG at your size. The tool picks the right method from the file you choose.' },
  { q: 'Why is my result a little smaller than the number I typed?', a: 'The goal is the best quality that stays under your limit, so the result usually lands slightly below it. It is never intentionally over.' },
  { q: 'Why is the file still over my size?', a: 'The tool stops at the smallest result it can make without making the file unusable. Reduce the pages or crop the image, or enter a larger size.' },
  SAFE_QA,
];

export const convertFaq: QA[] = [
  { q: 'Which image formats can I convert to JPEG?', a: 'Any format your browser can open, including PNG, WebP, GIF, BMP and SVG. HEIC photos from some phones may not open in every browser. If yours does not, export it as JPEG or PNG from your phone first.' },
  { q: 'Will the image lose quality?', a: 'JPEG is a lossy format, so the file is not identical to the original. We use a high quality setting, so differences are hard to see. Keep your original file.' },
  { q: 'Does the image size change?', a: 'The pixel dimensions stay the same. The file size often shrinks for PNG files. A photo that is already a JPEG may stay about the same or grow slightly.' },
  { q: 'What happens to a transparent background?', a: 'JPEG cannot store transparency, so transparent areas are filled with white.' },
  { q: 'Do I need a size limit?', a: 'No. This tool just converts. If a form has a size limit, use the JPEG by size or custom size tools instead.' },
  SAFE_QA,
];
