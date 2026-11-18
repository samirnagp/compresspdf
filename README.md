# EasyPDF (Next.js)

Dynamic routes: `/compress-pdf-to-{10,50,100,200}kb`, `/image-to-jpeg-{10,50,100,200}kb`.
API: `POST /api/compress-pdf` (Ghostscript), `POST /api/convert-image` (sharp), `GET /api/health`.

## Run locally
npm install && npm run dev   (PDF API needs Ghostscript: `gs` on PATH)

## Deploy on Render
1. Push to GitHub.
2. Render: New > Web Service > connect repo > Runtime: Docker.
3. Health check path: /api/health
4. Settings > Custom Domains: add www.easypdf.website, point the DNS CNAME to Render.

## Processing paths
- Files up to 5 MB (PDFs up to 30 pages) are compressed in the browser (canvas, pdf.js, jsPDF). Nothing is uploaded.
- If the browser result misses the target, or the file is larger, the user can opt in to server processing.
- Change the limits in `lib/client.ts` (CLIENT_MAX_BYTES, MAX_PDF_PAGES) and `lib/tools.ts` (MAX_UPLOAD_MB).

## CI
`.github/workflows/ci.yml` builds the app and the Docker image on every push and pull request.
In Render, set Auto-Deploy to "After CI Checks Pass" so a failing build never goes live.
