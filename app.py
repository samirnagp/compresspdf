import io
import os
import gc
from flask import Flask, render_template, request, send_file, jsonify, send_from_directory, Response
from flask_cors import CORS
from PIL import Image
import pypdf

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024

try:
    from flask_compress import Compress
    Compress(app)
except ImportError:
    pass


@app.after_request
def add_headers(response):
    if request.path.startswith('/static') or request.path.endswith(('.xml', '.txt')):
        response.headers['Cache-Control'] = 'public, max-age=604800, immutable'
    elif request.path in ['/', '/compress-jpeg', '/privacy', '/terms', '/about', '/contact']:
        response.headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'
    return response


def render_fallback(template_name, title, content):
    if os.path.exists(os.path.join(app.root_path, 'templates', template_name)):
        return render_template(template_name)
    html = (
        f'<!DOCTYPE html><html><head><meta charset="UTF-8">'
        f'<meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{title} | EasyPDF</title>'
        f'<style>body{{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}}'
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
    return render_fallback('privacy.html', 'Privacy Policy', '<p>EasyPDF processes files locally in browser memory or temporary RAM without storing user files.</p>')


@app.route('/terms')
def terms():
    return render_fallback('terms.html', 'Terms of Service', '<p>By using EasyPDF (www.easypdf.website), you agree to use our free compression tools responsibly.</p>')


@app.route('/about')
def about():
    return render_fallback('about.html', 'About Us', '<p>EasyPDF is a fast, privacy-first web tool for compressing PDFs and JPEGs to 10KB, 50KB, and 100KB.</p>')


@app.route('/contact')
def contact():
    return render_fallback('contact.html', 'Contact Us', '<p>Contact us at <strong>support@easypdf.website</strong>.</p>')


@app.route('/sitemap.xml')
@app.route('/sitemap_index.xml')
def sitemap():
    if os.path.exists(os.path.join(app.root_path, 'static', 'sitemap.xml')):
        return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')
    return send_from_directory(app.root_path, 'sitemap.xml', mimetype='application/xml')


@app.route('/robots.txt')
def robots():
    return Response(
        "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /health\n"
        "Sitemap: https://www.easypdf.website/sitemap.xml\n"
        "Sitemap: https://www.easypdf.website/sitemap_index.xml\n",
        mimetype='text/plain'
    )


@app.route('/health')
def health():
    return jsonify({"status": "healthy"})


def compress_pypdf_stream(input_bytes):
    reader = pypdf.PdfReader(io.BytesIO(input_bytes))
    writer = pypdf.PdfWriter()
    for page in reader.pages:
        page.compress_content_streams()
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    del reader
    gc.collect()
    return out.getvalue()


@app.route('/api/compress', methods=['POST'])
def compress_pdf_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Uploaded file must be a PDF"}), 400

    target_kb = request.form.get('target_kb', type=int) or 100
    target_kb = max(5, target_kb)
    target_bytes = target_kb * 1024
    input_bytes = file.read()

    if len(input_bytes) <= target_bytes:
        return send_file(io.BytesIO(input_bytes), mimetype='application/pdf', as_attachment=True, download_name=f"compressed_{file.filename}")

    try:
        light = compress_pypdf_stream(input_bytes)
        if len(light) <= target_bytes:
            return send_file(io.BytesIO(light), mimetype='application/pdf', as_attachment=True, download_name=f"compressed_{target_kb}kb_{file.filename}")
    except Exception:
        pass

    try:
        from pdf2image import convert_from_bytes
        if target_kb <= 15:
            max_dim, quality, color_mode = 420, 20, "L"
        elif target_kb <= 50:
            max_dim, quality, color_mode = 650, 35, "L"
        else:
            max_dim, quality, color_mode = 950, 55, "RGB"

        reader = pypdf.PdfReader(io.BytesIO(input_bytes))
        total_pages = len(reader.pages)
        del reader

        imgs = []
        for p in range(1, total_pages + 1):
            img = convert_from_bytes(input_bytes, first_page=p, last_page=p, dpi=100)[0]
            img.thumbnail((max_dim, max_dim), Image.Resampling.BOX)
            img = img.convert("L") if color_mode == "L" else img.convert("RGB")
            imgs.append(img)

        out = io.BytesIO()
        imgs[0].save(out, format='PDF', save_all=True, append_images=imgs[1:], quality=quality, optimize=True)
        del imgs, input_bytes
        gc.collect()
        out.seek(0)
        return send_file(out, mimetype='application/pdf', as_attachment=True, download_name=f"compressed_{target_kb}kb_{file.filename}")
    except Exception as err:
        gc.collect()
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))