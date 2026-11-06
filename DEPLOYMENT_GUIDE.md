# EasyPDF Compressor - Deployment & Integration Guide

This package provides a standalone, production-ready web application for compressing PDF files with strict target size limits (under 10 KB, 50 KB, 100 KB, or custom KB).

---

## Architecture Overview
1. **Frontend (Primary / 100% Client-Side):**
   - Uses `pdf.js` for canvas rasterization.
   - Uses `pdf-lib` for document reconstruction.
   - Zero file upload required: ensures total user privacy and zero server compute/bandwidth costs.
2. **Backend (Python / Flask + Poppler / Pillow):**
   - Serves the frontend assets.
   - Exposes `/api/compress` as a fallback or headless API endpoint.
   - Ready for Gunicorn, Docker, Render, or VPS deployment.

---

## Option 1: Run Locally (Fast Setup)

```bash
# 1. Unzip the project
unzip easypdf-compressor-v2.zip
cd easypdf-compressor

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start the server
python app.py
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Option 2: Deploy to Render

1. Push this project folder to your GitHub / GitLab repository.
2. Log into Render Dashboard.
3. Click New + -> Web Service.
4. Connect your repository.
5. Set:
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
6. Click Deploy.
