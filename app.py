import io
import os
import gc
from flask import Flask, render_template, request, send_file, jsonify, send_from_directory, Response
from flask_cors import CORS
from PIL import Image
import pypdf

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024  # 30 MB max

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


def render_page_or_fallback(template_name, title, heading, body_html):
    template_path = os.path.join(app.root_path, 'templates', template_name)
    if os.path.exists(template_path):
        return render_template(template_name)

    fallback_html = (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '  <meta charset="UTF-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f'  <title>{title} | EasyPDF</title>\n'
        '  <style>\n'
        '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; max-width: 800px; margin: 40px auto; padding: 0 20px; }\n'
        '    .card { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }\n'
        '    h1 { margin-bottom: 16px; color: #0f172a; }\n'
        '    p { margin-bottom: 14px; color: #475569; }\n'
        '    a { color: #2563eb; text-decoration: none; }\n'
        '    footer { margin-top: 30px; font-size: 0.9rem; color: #64748b; text-align: center; }\n'
        '  </style>\n'
        '</head>\n'
        '<body>\n'
        '  <div class="card">\n'
        f'    <h1>{heading}</h1>\n'
        f'    {body_html}\n'
        '  </div>\n'
        '  <footer>\n'
        '    <a href="/">Home</a> &bull; <a href="/compress-jpeg">Compress JPEG</a> &bull; <a href="/privacy">Privacy Policy</a> &bull; <a href="/terms">Terms</a> &bull; <a href="/about">About</a> &bull; <a href="/contact">Contact</a>\n'
        '  </footer>\n'
        '</body>\n'
        '</html>'
    )
    return Response(fallback_html, mimetype='text/html')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/compress-jpeg')
def compress_jpeg():
    template_path = os.path.join(app.root_path, 'templates', 'compress-jpeg.html')
    if os.path.exists(template_path):
        return render_template('compress-jpeg.html')
    return render_template('index.html')


@app.route('/privacy')
def privacy():
    body = (
        '<p>At EasyPDF (www.easypdf.website), your privacy is our priority. Most file compression tasks are performed locally inside your web browser using client-side JavaScript and HTML5 Canvas without uploading files to our servers.</p>'
        '<p><strong>1. File Handling:</strong> When files are processed via our API, they are handled strictly in temporary memory (RAM) and immediately discarded after returning the compressed file. We do not permanently store or inspect user files.</p>'
        '<p><strong>2. Cookies &amp; Advertising:</strong> We may use standard analytics and third-party advertising partners (such as Google AdSense) that use cookies to serve relevant ads based on prior visits.</p>'
    )
    return render_page_or_fallback('privacy.html', 'Privacy Policy', 'Privacy Policy', body)


@app.route('/terms')
def terms():
    body = (
        '<p>Welcome to EasyPDF (www.easypdf.website). By accessing and using our online PDF and image compression utilities, you agree to comply with these Terms of Service.</p>'
        '<p><strong>1. Service Usage:</strong> EasyPDF provides free browser-based and automated document optimization tools for personal, educational, and professional use. You agree not to misuse the service or attempt to disrupt server infrastructure.</p>'
        '<p><strong>2. File Ownership &amp; Responsibility:</strong> You retain full ownership of all documents and images you process. You are solely responsible for ensuring you have the legal right to process any files loaded into the tool.</p>'
        '<p><strong>3. Disclaimer of Warranties:</strong> The tools are provided "as is" without warranties of any kind. Always keep a backup copy of your original documents before compressing them.</p>'
    )
    return render_page_or_fallback('terms.html', 'Terms of Service', 'Terms of Service', body)


@app.route('/about')
def about():
    body = (
        '<p><strong>EasyPDF</strong> is a fast, privacy-first web utility designed to help students, job applicants, and professionals optimize PDF documents and JPEG images to exact file size limits (such as 10 KB, 50 KB, and 100 KB).</p>'
        '<p>Built with modern web standards, EasyPDF prioritizes speed, accessibility on mobile devices, and strict data privacy—processing files locally in your browser memory whenever possible without permanent server storage.</p>'
    )
    return render_page_or_fallback('about.html', 'About Us', 'About EasyPDF', body)


@app.route('/contact')
def contact():
    body = (
        '<p>Have questions, feedback, or bug reports regarding EasyPDF? We would love to hear from you.</p>'
        '<p><strong>Support Email:</strong> support@easypdf.website</p>'
        '<p>Please include details about your browser and file type if you are reporting a technical issue so we can resolve it promptly.</p>'
    )
    return render_page_or_fallback('contact.html', 'Contact Us', 'Contact Us', body)


@app.route('/sitemap.xml')
@app.route('/sitemap_index.xml')
def sitemap():
    if os.path.exists(os.path.join(app.root_path, 'static', 'sitemap.xml')):
        return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')
    if os.path.exists(os.path.join(app.root_path, 'sitemap.xml')):
        return send_from_directory(app.root_path, 'sitemap.xml', mimetype='application/xml')

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '  <url>\n'
        '    <loc>https://www.easypdf.website/</loc>\n'
        '    <lastmod>2026-11-13</lastmod>\n'
        '    <changefreq>weekly</changefreq>\n'
        '    <priority>1.0</priority>\n'
        '  </url>\n'
        '  <url>\n'
        '    <loc>https://www.easypdf.website/compress-jpeg</loc>\n'
        '    <lastmod>2026-11-13</lastmod>\n'
        '    <changefreq>monthly</changefreq>\n'
        '    <priority>0.8</priority>\n'
        '  </url>\n'
        '  <url>\n'
        '    <loc>https://www.easypdf.website/privacy</loc>\n'
        '    <lastmod>2026-11-13</lastmod>\n'
        '    <changefreq>monthly</changefreq>\n'
        '    <priority>0.5</priority>\n'
        '  </url>\n'
        '  <url>\n'
        '    <loc>https://www.easypdf.website/terms</loc>\n'
        '    <lastmod>2026-11-13</lastmod>\n'
        '    <changefreq>monthly</changefreq>\n'
        '    <priority>0.5</