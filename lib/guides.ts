export type Section = { h: string; p?: string[]; ul?: string[]; ol?: string[] };
export type Guide = {
  slug: string; title: string; description: string; updated: string; intro: string;
  sections: Section[]; links: { label: string; href: string }[];
};

export const guides: Guide[] = [
  {
    slug: 'reduce-pdf-size-for-online-application',
    title: 'How to Reduce a PDF’s File Size for an Online Application',
    description: 'Practical ways to get a PDF under a form’s size limit without making it unreadable: scanning settings, export options, and when to compress.',
    updated: 'November 19, 2026',
    intro: 'Job portals, college applications and government forms often reject PDFs over a set size. The fix is usually simple, but the best method depends on where your PDF came from. This guide walks through the options, from the most effective to the last resort.',
    sections: [
      { h: 'Why your PDF is too big', p: [
        'A PDF made from typed text is usually small, because it stores letters and fonts. A PDF made from a scan or phone photo is different: every page is a picture, and a color picture of a full page can easily be hundreds of kilobytes or several megabytes.',
        'So the size comes from the pictures, and the way to shrink it is to reduce how much picture data each page holds.'] },
      { h: 'Check the limit and the units first', ul: [
        'Look at whether the limit is in KB or MB. One MB is about 1,000 to 1,024 KB, depending on how the system counts.',
        'Aim for roughly 10% under the limit. Some portals count slightly differently from your device.',
        'Note whether the form allows several files. If it does, splitting a long document may be easier than compressing it hard.'] },
      { h: 'Start from the original if you have it', p: [
        'If your document began as a Word, Google Docs or similar file, export it to PDF instead of printing and scanning it. The result keeps real text and is often tiny.',
        'In Word, choose Save As or Export, pick PDF, and select the option for minimum size (publishing online). That setting lowers the resolution of any images inside the document.'] },
      { h: 'If you only have a scan or photo', ul: [
        'Scan at 150 to 200 dpi. Higher settings rarely improve readability on screen but multiply the file size.',
        'Use grayscale, or black and white for plain text pages. Skip color unless the form needs it, such as a stamp or photo.',
        'Use your scanning app’s document mode so pages are cropped square and the background is clean.',
        'Remove blank pages and anything the form does not ask for.'] },
      { h: 'Compress it with EasyPDF', ol: [
        'Open the Compress PDF tool and choose your file.',
        'Pick the size closest to your limit without going over. Larger targets keep more quality.',
        'Select Compress PDF and wait a few seconds.',
        'Download the result and check it before you submit.'],
        p: ['Files up to 5 MB are processed in your browser and are not uploaded. In that mode each page is turned into an image, so the text in the compressed copy is no longer selectable. Keep your original file.'] },
      { h: 'Check the file before you submit', ul: [
        'Open it and zoom in on signatures, dates, numbers and small print. If they are hard to read, use a larger target size.',
        'Make sure the page order is right and no page was cut off.',
        'Check the final size in your file manager. Right-click or long-press the file and look at its properties.',
        'Use a simple file name without unusual symbols, in case the portal rejects them.'] },
      { h: 'If it is still too big', ul: [
        'Choose the next size up if the form allows it.',
        'Remove pages that are not required, or split the document into parts.',
        'Rescan at a lower resolution or in black and white, then compress again.',
        'If nothing fits, contact the portal. Some can accept a larger file or another way of sending it.'] },
    ],
    links: [
      { label: 'Compress PDF to 100 KB', href: '/compress-pdf-to-100kb' },
      { label: 'Compress PDF to 200 KB', href: '/compress-pdf-to-200kb' },
      { label: 'Compress PDF to 50 KB', href: '/compress-pdf-to-50kb' },
    ],
  },
  {
    slug: 'photo-and-signature-under-50kb-for-online-forms',
    title: 'How to Get a Photo or Signature Under 50 KB for Online Forms',
    description: 'How to take, crop and convert a photo or signature to a small JPEG that meets an online form’s size limit, with tips to keep it sharp.',
    updated: 'November 19, 2026',
    intro: 'Many application forms ask for a passport-style photo or a signature as a small JPEG, often under 50 KB or 100 KB. A phone photo can be several megabytes, so it has to be prepared. This guide shows how to do it without ending up with a blurry result.',
    sections: [
      { h: 'Why phone photos are far too large', p: [
        'Phone cameras capture many millions of pixels. That is useful for printing but far more than a web form needs. To reach 50 KB, a photo has to lose both resolution and some quality, and the best results come from controlling both.'] },
      { h: 'Read the requirements first', ul: [
        'File size limit, in KB.',
        'File type. Most forms want JPEG, sometimes written as JPG.',
        'Pixel dimensions or aspect ratio, if the form states them.',
        'Background color and whether glasses or head coverings are allowed, for photos.'],
        p: ['EasyPDF controls the file size. It does not crop to a shape or set exact pixel dimensions, so do the cropping first.'] },
      { h: 'Taking a good photo', ul: [
        'Stand facing a plain, light wall with even light from the front, such as a window. Avoid shadows on your face.',
        'Hold the phone at eye level, at arm’s length or on a stand, and keep your face centered.',
        'Turn off beauty filters and effects. They add detail that makes the file bigger and the photo look unnatural.'] },
      { h: 'Making a clean signature', ul: [
        'Sign with a dark pen on plain white paper. A thicker pen reads better when the image is shrunk.',
        'Photograph it from straight above in good daylight, so there is no shadow or angle.',
        'Crop tightly around the signature with a small margin. A white background compresses very well, so signatures often become very small files.'] },
      { h: 'Step by step', ol: [
        'Crop the photo or signature to what the form needs, using your phone’s editor.',
        'Open the Image to JPEG tool and choose the cropped image.',
        'Select the size from the form, such as 50 KB.',
        'Select Convert to JPEG, download the result and check it.'] },
      { h: 'Keeping quality as high as possible', ul: [
        'Crop before converting. Fewer empty pixels means more of the file size goes to the part people see.',
        'Pick the largest size the form allows. A 100 KB limit looks clearly better than 50 KB.',
        'Always convert from the original, never from an already compressed copy. Each re-save loses detail.',
        'If a face looks blocky, crop closer or try again with a larger target.'] },
      { h: 'Common problems', ul: [
        'The result is smaller in pixels than the form requires. The tool lowers quality first and shrinks dimensions only if it must. If your form needs exact pixels, set those in a photo editor first, then convert. It will usually only need to lower the quality.',
        'A PNG with a transparent background turns white, because JPEG cannot store transparency.',
        'An iPhone HEIC photo does not open. Export or share it as a JPEG, or take a screenshot of the photo, and try again.',
        'The form rejects the file name. Rename it with letters and numbers only.'] },
    ],
    links: [
      { label: 'Image to JPEG under 50 KB', href: '/image-to-jpeg-50kb' },
      { label: 'Image to JPEG under 100 KB', href: '/image-to-jpeg-100kb' },
      { label: 'Image to JPEG under 10 KB', href: '/image-to-jpeg-10kb' },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
