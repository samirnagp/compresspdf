import io
import os
from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
import pypdf

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 35 * 1024 * 1024  # 35 MB

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

def compress_with_pypdf(input_bytes):
    """Safe pure-python PDF stream compressor."""
    reader = pypdf.PdfReader(io.BytesIO(input_bytes))
    writer = pypdf.PdfWriter()

    for page in reader.pages:
        page.compress_content_streams()  # FlateDecode compression on text/vectors
        writer.add_page(page)

    # Enable stream compression and clean up unused objects
    writer.add_metadata(reader.metadata if reader.metadata else {})
    
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()
@app.route('/api/compress', methods=['POST'])
def compress_pdf_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "File must be a PDF"}), 400

    target_kb = request.form.get('target_kb', type=int)
    if not target_kb or target_kb < 5:
        target_kb = 100

    target_bytes = target_kb * 1024
    input_bytes = file.read()
    orig_size = len(input_bytes)

    if orig_size <= target_bytes:
        return send_file(
            io.BytesIO(input_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{file.filename}"
        )

    # 1. Try Rasterization via pdf2image + Pillow
    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(input_bytes)
        num_pages = len(images)

        # Extreme budget rules (e.g. 10 KB)
        if target_kb <= 15:
            max_dimension = 450
            initial_quality = 20
            mode = "L"  # Grayscale: critical to achieve < 10KB
        elif target_kb <= 50:
            max_dimension = 750
            initial_quality = 35
            mode = "RGB"
        else:
            max_dimension = 1100
            initial_quality = 60
            mode = "RGB"

        best_pdf_bytes = None
        quality = initial_quality
        scale = max_dimension

        for attempt in range(4):
            compressed_page_images = []
            for img in images:
                cur_img = img.copy()
                cur_img.thumbnail((scale, scale), Image.Resampling.LANCZOS)
                
                # Convert color mode
                if mode == "L":
                    cur_img = cur_img.convert("L")
                elif cur_img.mode in ("RGBA", "P"):
                    cur_img = cur_img.convert("RGB")

                compressed_page_images.append(cur_img)

            out_buffer = io.BytesIO()
            if compressed_page_images:
                compressed_page_images[0].save(
                    out_buffer,
                    format='PDF',
                    save_all=True,
                    append_images=compressed_page_images[1:],
                    quality=quality,
                    optimize=True
                )

            result_data = out_buffer.getvalue()
            best_pdf_bytes = result_data

            if len(result_data) <= target_bytes:
                break

            # Squeeze further if still above limit
            quality = max(10, int(quality * 0.65))
            scale = max(300, int(scale * 0.70))
            mode = "L"  # Fallback to grayscale on retry

        return send_file(
            io.BytesIO(best_pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{target_kb}kb_{file.filename}"
        )

    except Exception as img_err:
        # 2. Poppler missing or failed: Fallback to pure-python pypdf
        print(f"pdf2image fallback triggered: {img_err}")
        try:
            fallback_bytes = compress_with_pypdf(input_bytes)
            return send_file(
                io.BytesIO(fallback_bytes),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"compressed_{file.filename}"
            )
        except Exception as pypdf_err:
            return jsonify({"error": f"Compression failed: {str(pypdf_err)}"}), 500
            @app.route('/privacy')
def privacy_page():
    return render_template('privacy.html')

@app.route('/sitemap.xml')
def sitemap_file():
    return send_file('sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots_file():
    return send_file('robots.txt', mimetype='text/plain')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
