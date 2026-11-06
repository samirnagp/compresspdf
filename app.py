import io
import os
from flask import Flask, render_template, request, send_file, jsonify
from PIL import Image
from pdf2image import convert_from_bytes

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 35 * 1024 * 1024  # 35 MB max upload

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "EasyPDF Compressor"})

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
    orig_size = len(input_bytes)

    if orig_size <= target_bytes:
        return send_file(
            io.BytesIO(input_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{file.filename}"
        )

    try:
        images = convert_from_bytes(input_bytes)
        num_pages = len(images)

        if target_kb <= 15:
            max_dimension = 700
            initial_quality = 30
        elif target_kb <= 60:
            max_dimension = 900
            initial_quality = 45
        else:
            max_dimension = 1200
            initial_quality = 65

        best_pdf_bytes = None
        quality = initial_quality
        scale = max_dimension

        for attempt in range(4):
            compressed_page_images = []
            for img in images:
                cur_img = img.copy()
                cur_img.thumbnail((scale, scale), Image.Resampling.LANCZOS)
                
                if cur_img.mode in ("RGBA", "P"):
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
            
            quality = max(15, int(quality * 0.70))
            scale = max(400, int(scale * 0.75))

        out_stream = io.BytesIO(best_pdf_bytes)
        return send_file(
            out_stream,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{target_kb}kb_{file.filename}"
        )

    except Exception as e:
        return jsonify({"error": f"Server compression failed: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
