lucide.createIcons();

let currentFile = null;
let currentTargetKb = 100;
let pdfDocProxy = null;

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('pdfFileInput');
const fileSelectedSection = document.getElementById('fileSelectedSection');
const fileName = document.getElementById('fileName');
const fileDetails = document.getElementById('fileDetails');
const startCompressBtn = document.getElementById('startCompressBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressStatus = document.getElementById('progressStatus');
const progressPercent = document.getElementById('progressPercent');
const resultSection = document.getElementById('resultSection');
const resOrigSize = document.getElementById('resOrigSize');
const resCompSize = document.getElementById('resCompSize');
const resSavedBadge = document.getElementById('resSavedBadge');
const downloadBtn = document.getElementById('downloadBtn');

const presetButtons = document.querySelectorAll('.preset-btn');
const customInputWrap = document.getElementById('customInputWrap');
const customKbInput = document.getElementById('customKb');

presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    presetButtons.forEach(b => {
      b.className = 'preset-btn px-4 py-3 rounded-xl border border-slate-200 hover:border-brand-500 bg-white text-slate-700 font-semibold flex flex-col items-center justify-center transition-all';
    });
    btn.className = 'preset-btn px-4 py-3 rounded-xl border-2 border-brand-600 bg-brand-50 text-brand-700 font-bold flex flex-col items-center justify-center transition-all shadow-sm';

    const kbVal = btn.dataset.kb;
    if (kbVal === 'custom') {
      customInputWrap.classList.remove('hidden');
      currentTargetKb = parseInt(customKbInput.value, 10) || 75;
    } else {
      customInputWrap.classList.add('hidden');
      currentTargetKb = parseInt(kbVal, 10);
    }
  });
});

customKbInput.addEventListener('input', () => {
  currentTargetKb = parseInt(customKbInput.value, 10) || 50;
});

fileInput.addEventListener('change', async (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function handleFile(file) {
  if (!file || file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    return;
  }
  currentFile = file;
  fileName.textContent = file.name;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    fileDetails.textContent = `${formatBytes(file.size)} • ${pdfDocProxy.numPages} page(s)`;
    fileSelectedSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
  } catch (err) {
    alert('Failed to read PDF. It might be password-protected or corrupted.');
  }
}

['dragenter', 'dragover'].forEach(name => {
  dropzone.addEventListener(name, (e) => {
    e.preventDefault();
    dropzone.classList.add('border-brand-600', 'bg-indigo-50/50');
  });
});

['dragleave', 'drop'].forEach(name => {
  dropzone.addEventListener(name, (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-brand-600', 'bg-indigo-50/50');
  });
});

dropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt.files && dt.files[0]) {
    handleFile(dt.files[0]);
  }
});

startCompressBtn.addEventListener('click', async () => {
  if (!currentFile || !pdfDocProxy) return;

  startCompressBtn.disabled = true;
  progressSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';

  try {
    const compressedBlob = await executeCompression(pdfDocProxy, currentTargetKb, (msg, pct) => {
      progressStatus.textContent = msg;
      progressBar.style.width = pct + '%';
      progressPercent.textContent = Math.round(pct) + '%';
    });

    resOrigSize.textContent = formatBytes(currentFile.size);
    resCompSize.textContent = formatBytes(compressedBlob.size);
    
    const savedPct = Math.max(0, Math.round((1 - compressedBlob.size / currentFile.size) * 100));
    resSavedBadge.textContent = `-${savedPct}%`;

    const blobUrl = URL.createObjectURL(compressedBlob);
    downloadBtn.href = blobUrl;
    downloadBtn.download = `compressed_${currentTargetKb}kb_${currentFile.name}`;

    resultSection.classList.remove('hidden');
    lucide.createIcons();
  } catch (err) {
    console.error(err);
    progressStatus.textContent = 'Browser compression failed; trying server-side fallback...';
    try {
      await runServerSideFallback();
      progressStatus.textContent = 'Completed!';
      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
    } catch (fallbackError) {
      console.error(fallbackError);
      progressStatus.textContent = 'Compression failed';
      alert(`Browser compression failed, and the server-side fallback failed: ${fallbackError.message}`);
    }
  } finally {
    startCompressBtn.disabled = false;
  }
});

async function executeCompression(pdfDoc, targetKb, onProgress) {
  const targetBytes = targetKb * 1024;
  const numPages = pdfDoc.numPages;

  let scale = 1.0;
  let quality = 0.70;

  if (targetKb <= 15) {
    scale = 0.5;
    quality = 0.28;
  } else if (targetKb <= 50) {
    scale = 0.75;
    quality = 0.50;
  } else if (targetKb <= 100) {
    scale = 0.95;
    quality = 0.65;
  }

  async function renderDoc(curScale, curQuality) {
    const { PDFDocument } = PDFLib;
    const outPdf = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      onProgress(`Optimizing page ${i} of ${numPages}...`, ((i - 0.5) / numPages) * 90);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: curScale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d', { alpha: false });

      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgDataUrl = canvas.toDataURL('image/jpeg', curQuality);
      const embeddedImg = await outPdf.embedJpg(imgDataUrl);

      const origViewport = page.getViewport({ scale: 1.0 });
      const newPage = outPdf.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height
      });
    }

    const savedBytes = await outPdf.save({ useObjectStreams: true });
    return new Blob([savedBytes], { type: 'application/pdf' });
  }

  let resultBlob = await renderDoc(scale, quality);

  if (resultBlob.size > targetBytes && quality > 0.15) {
    onProgress('Refining compression to hit target limit...', 95);
    const ratio = Math.sqrt(targetBytes / resultBlob.size);
    const secondScale = Math.max(0.35, scale * ratio);
    const secondQuality = Math.max(0.15, quality * ratio);
    resultBlob = await renderDoc(secondScale, secondQuality);
  }

  onProgress('Completed!', 100);
  return resultBlob;
}

async function runServerSideFallback() {
  const formData = new FormData();
  formData.append('file', currentFile);
  formData.append('target_kb', currentTargetKb);

  const res = await fetch('/api/compress', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const responseText = await res.text();
    let errorMessage = responseText;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || responseText;
    } catch {
      // Keep the response body when the server does not return JSON.
    }
    throw new Error(errorMessage || `Server compression failed (${res.status})`);
  }

  const blob = await res.blob();
  resOrigSize.textContent = formatBytes(currentFile.size);
  resCompSize.textContent = formatBytes(blob.size);
  const savedPct = Math.max(0, Math.round((1 - blob.size / currentFile.size) * 100));
  resSavedBadge.textContent = `-${savedPct}%`;
  const blobUrl = URL.createObjectURL(blob);
  downloadBtn.href = blobUrl;
  downloadBtn.download = `compressed_${currentTargetKb}kb_${currentFile.name}`;
  resultSection.classList.remove('hidden');
  lucide.createIcons();
}
