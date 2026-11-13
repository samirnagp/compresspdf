import io
import os
import gc
from flask import Flask, render_template, request, send_file, jsonify, send_from_directory, Response
from flask_cors import CORS
from PIL import Image
import pypdf

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024  # 30 MB max[cite: 5]

try:
    from flask_compress import Compress
    Compress(app)
except ImportError:
    pass


@app.after_request
def add_performance_headers(response):
    if request.path.startswith('/static') or request.path.endswith('.xml') or request.path.endswith('.txt'):
        response.headers['Cache-Control'] = 'public, max-age=604800, immutable'
    elif request.path in ['/', '/compress-jpeg', '/privacy', '/terms', '/about', '/contact']:
        response.headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'
    return response


def render_fallback(template_name, title, content):
    path = os.path.join(app.root_path, 'templates', template_name)
    if os.path.exists(path):
        return render_template(template_name)
    html = (
        f'<!DOCTYPE html><html><head><meta charset="UTF-8">'
        f'<meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{title} | EasyPDF</title>'
        f'<style>body{{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1e293b}}'
        f'a{{color:#2563eb;text-decoration:none}}</style></head><body>'
        f'<h1>{title}</h1>{content}'
        f'<hr><p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | '
        f'<a href="/terms">Terms</a> | <a href="/about">About</a> | <a href="/contact">Contact</a></p>'
        f'</body></html>'
    )
    return Response(html, mimetype='text/html')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/compress-jpeg')
def compress_jpeg():
    if os.path.exists(os.path.join(app.root_path, 'templates', 'compress-jpeg.html')):
        return render_template('compress-jpeg.html')
    return render_template('index.html')


@app.route('/privacy')
def privacy():
    return render_fallback(
        'privacy.html',
        'Privacy Policy',
        '<p>EasyPDF processes files locally in browser memory or temporary RAM without storing user files. We use standard cookies and Google AdSense.</p>'
    )


@app.route('/terms')
def terms():
    return render_fallback(
        'terms.html',
        'Terms of Service',
        '<p>By using EasyPDF (www.easypdf.website), you agree to use our free compression tools responsibly. You retain full ownership of your files.</p>'
    )


@app.route('/about')
def about():
    return render_fallback(
        'about.html',
        'About Us',
        '<p>EasyPDF is a fast, privacy-first web tool for compressing PDF documents and JPEG images to exact target sizes like 10KB, 50KB, and 100KB.</p>'
    )


@app.route('/contact')
def contact():
    return render_fallback(
        'contact.html',
        'Contact Us',
        '<p>For support, feedback, or inquiries, email us at <strong>support@easypdf.website</strong>.</p>'
    )


@app.route('/sitemap.xml')
@app.route('/sitemap_index.xml')
def sitemap():
    if os.path.exists(os.path.join(app.root_path, 'static', 'sitemap.xml')):
        return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')
    return send_from_directory(app.root_path, 'sitemap.xml', mimetype='application/xml')


@app.route('/robots.txt')
def robots():
    txt = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /health\n"
        "Sitemap: https://www.easypdf.website/sitemap.xml\n"
        "Sitemap: https://www.easypdf.website/sitemap_index.xml\n"
    )
    return Response(txt, mimetype='text/plain')


@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "EasyPDF Compressor"})[cite: 5]


def compress_pypdf_stream(input_bytes):
    reader = pypdf.PdfReader(io.BytesIO(input_bytes))[cite: 5]
    writer = pypdf.PdfWriter()[cite: 5]
    for page in reader.pages:[cite: 5]
        page.compress_content_streams()[cite: 5]
        writer.add_page(page)[cite: 5]
    out = io.BytesIO()[cite: 5]
    writer.write(out)[cite: 5]
    del reader[cite: 5]
    gc.collect()[cite: 5]
    return out.getvalue()[cite: 5]


@app.route('/api/compress', methods=['POST'])
def compress_pdf_api():
    if 'file' not in request.files:[cite: 5]
        return jsonify({"error": "No file uploaded"}), 400[cite: 5]

    file = request.files['file'][cite: 5]
    if not file.filename.lower().endswith('.pdf'):[cite: 5]
        return jsonify({"error": "Uploaded file must be a PDF"}), 400[cite: 5]