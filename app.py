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

# Optional Gzip compression if flask_compress is present[cite: 5]
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
    """Renders the HTML template if it exists, otherwise serves a clean compliant page so Googlebot never gets a 404."""
    template_path = os.path.join(app.root_path, 'templates', template_name)
    if os.path.exists(template_path):
        return render_template(template_name)
    
    fallback_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | EasyPDF</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; max-width: 800px; margin: 40px auto; padding: 0 20px; }}
    .card {{ background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }}
    h1 {{ margin-bottom: 16px; color: #0f172a; }}
    p {{ margin-bottom: 14px; color: #475569; }}
    a {{ color: #2563eb; text-decoration: none; }}
    footer {{ margin-top: 30px; font-size: 0.9rem; color: #64748b; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>{heading}</h1>
    {body_html}
  </div>
  <footer>
    <a href="/">Home</a> • <a href="/compress-jpeg">Compress JPEG</a> • <a href="/privacy">Privacy Policy</a> • <a href="/terms">Terms</a> • <a href="/about">About</a> • <a href="/contact">Contact</a>
  </footer>
</body>
</html>"""
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
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    body = """
    <p>Welcome to EasyPDF (www.easypdf.website). By accessing and using our online PDF and image compression utilities, you agree to comply with these Terms of Service.</p>
    <p><strong>1. Service Usage:</strong> EasyPDF provides free browser-based and automated document optimization tools for personal, educational, and professional use. You agree not to misuse the service or attempt to disrupt server infrastructure.</p>
    <p><strong>2. File Ownership & Responsibility:</strong> You retain full ownership of all documents and images you process. You are solely responsible for ensuring you have the legal right to process any files uploaded or loaded into the tool.</p>
    <p><strong>3. Disclaimer of Warranties:</strong> The tools are provided "as is" without warranties of any kind. Always keep a backup copy of your original documents before compressing them.</p>
    """
    return render_page_or_fallback('terms.html', 'Terms of Service', 'Terms of Service', body)

@app.route('/about')
def about():
    body = """
    <p><strong>EasyPDF</strong> is a fast, privacy-first web utility designed to help students, job applicants, and professionals optimize PDF documents and JPEG images to exact file size limits (such as 10 KB, 50 KB, and 100 KB).</p>
    <p>Built with modern web standards, EasyPDF prioritizes speed, accessibility on mobile devices, and strict data privacy—processing files locally in your browser memory whenever possible without permanent server storage.</p>
    """
    return render_page_or_fallback('about.html', 'About Us', 'About EasyPDF', body)

@app.route('/contact')
def contact():
    body = """
    <p>Have questions, feedback, or bug reports regarding EasyPDF? We would love to hear from you.</p>
    <p><strong>Support Email:</strong> support@easypdf.website</p>
    <p>Please include details about your browser and file type if you are reporting a technical issue so we can resolve it promptly.</p>
    """
    return render_page_or_fallback('contact.html', 'Contact Us', 'Contact Us', body)

@app.route('/sitemap.xml')
def sitemap():
    # Check static folder first, then root folder
    if os.path.exists(os.path.join(app.root_path, 'static', 'sitemap.xml')):
        return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')
    if os.path.exists(os.path.join(app.root_path, 'sitemap.xml')):
        return send_from_directory(app.root_path, 'sitemap.xml', mimetype='application/xml')
    
    # Dynamic fallback sitemap so it never returns 404
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.easypdf.website/</loc><priority>1.0</priority></url>
  <url><loc>https://www.easypdf.website/compress-jpeg</loc><priority>0.8</priority></url>
  <url><loc>https://www.easypdf.website/privacy</loc><priority>0.5</priority></url>
  <url><loc>https://www.easypdf.website/terms</loc><priority>0.5</priority></url>
  <url><loc>https://www.easypdf.website/about</loc><priority>0.5</priority></url>
  <url><loc>https://www.easypdf.website/contact</loc><priority>0.5</priority></url>
</urlset>"""
    return Response(xml, mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    robots_content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /health\n"
        "Sitemap: https://www.easypdf.website/sitemap.xml\n"
    )
    return Response(robots_content, mimetype='text/plain')
