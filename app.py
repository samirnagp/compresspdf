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

    if len(input_bytes) <= target_bytes:
        return send_file(
            io.BytesIO(input_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"compressed_{file.filename}"
        )

    try:
        light_compressed = compress_pypdf_stream(input_bytes)
        if len(light_compressed) <= target_bytes:
            return send_file(
                io.BytesIO(light_compressed),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"compressed_{target_kb}kb_{file.filename}"
            )
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

        processed_images = []
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
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)