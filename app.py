import io
import os
import gc
from flask import Flask, render_template, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import pypdf

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024  # 30 MB max

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt', mimetype='text/plain')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "EasyPDF Compressor"})

def compress_pypdf_stream(input_bytes):
    """Fast, zero-RAM pure Python compression for text and stream structures."""
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

    target_kb = request.form.get('target_kb', type=int)
    if not target_kb or target_kb < 5:
        target_kb = 100

    target_bytes = target_kb * 1024
    input_bytes = file.read()

    # If file is already smaller than target budget, return it directly
    if len(input_bytes) <= target_bytes:
        return send_file(
            io.BytesIO(input_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{file.filename}"
        )

    # 1. Try lightweight stream compression first
    try:
        light_compressed = compress_pypdf_stream(input_bytes)
        if len(light_compressed) <= target_bytes or target_kb > 100:
            return send_file(
                io.BytesIO(light_compressed),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"compressed_{target_kb}kb_{file.filename}"
            )
    except Exception as e:
        print(f"PyPDF stream attempt skipped: {e}")

    # 2. Memory-safe page-by-page Pillow rasterization
    try:
        from pdf2image import convert_from_bytes

        if target_kb <= 15:
            max_dim = 420
            quality = 20
            color_mode = "L"  # Grayscale slashes byte weight
        elif target_kb <= 50:
            max_dim = 650
            quality = 35
            color_mode = "L"
        else:
            max_dim = 950
            quality = 55
            color_mode = "RGB"

        reader = pypdf.PdfReader(io.BytesIO(input_bytes))
        total_pages = len(reader.pages)
        del reader

        processed_images = []

        # Process page-by-page to prevent exceeding 512MB RAM limits
        for p in range(1, total_pages + 1):
            single_page_img = convert_from_bytes(
                input_bytes,
                first_page=p,
                last_page=p,
                dpi=100
            )[0]

            single_page_img.thumbnail((max_dim, max_dim), Image.Resampling.BOX)

            if color_mode == "L":
                single_page_img = single_page_img.convert("L")
            elif single_page_img.mode in ("RGBA", "P"):
                single_page_img = single_page_img.convert("RGB")

            processed_images.append(single_page_img)

        out_stream = io.BytesIO()
        processed_images[0].save(
            out_stream,
            format='PDF',
            save_all=True,
            append_images=processed_images[1:],
            quality=quality,
            optimize=True
        )

        del processed_images
        del input_bytes
        gc.collect()

        out_stream.seek(0)
        return send_file(
            out_stream,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{target_kb}kb_{file.filename}"
        )

    except Exception as err:
        gc.collect()
        print(f"Fallback raster error: {err}")
        return jsonify({"error": f"Compression server constraint: {str(err)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
