#!/usr/bin/env python3
"""
SPHERA Reels Persistence API
Runs on port 5050 — nginx proxies /api/ here
Stores uploaded videos in /opt/sphera/uploads/
Persists reel metadata in /opt/sphera/data/reels.json
"""
import os, json, uuid, time
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


UPLOAD_DIR = '/opt/sphera/uploads'
DATA_FILE  = '/opt/sphera/data/reels.json'
MAX_SIZE   = 200 * 1024 * 1024  # 200 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs('/opt/sphera/data', exist_ok=True)

def load_reels():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_reels(reels):
    with open(DATA_FILE, 'w') as f:
        json.dump(reels, f, indent=2)

@app.route('/api/reels', methods=['GET'])
def get_reels():
    reels = load_reels()
    return jsonify(reels)

@app.route('/api/reels/upload', methods=['POST'])
def upload_reel():
    if 'video' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    # Generate unique filename
    ext = os.path.splitext(secure_filename(file.filename))[1].lower()
    if ext not in ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.gif']:
        ext = '.mp4'
    filename = str(uuid.uuid4()) + ext
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)

    # Build reel entry
    caption  = request.form.get('caption', 'My Reel ✦')
    username = request.form.get('username', 'You')
    initial  = (username[0] if username else 'Y').upper()

    reel = {
        'id':       str(uuid.uuid4()),
        'filename': filename,
        'url':      f'/uploads/{filename}',
        'caption':  caption,
        'username': username,
        'initial':  initial,
        'grad':     'linear-gradient(135deg,#7c3aed,#ec4899)',
        'likes':    0,
        'comments': 0,
        'ts':       int(time.time())
    }

    reels = load_reels()
    reels.insert(0, reel)   # newest first
    save_reels(reels)

    return jsonify(reel), 201

@app.route('/api/reels/<reel_id>', methods=['DELETE'])
def delete_reel(reel_id):
    reels = load_reels()
    reel  = next((r for r in reels if r['id'] == reel_id), None)
    if reel:
        filepath = os.path.join(UPLOAD_DIR, reel['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        reels = [r for r in reels if r['id'] != reel_id]
        save_reels(reels)
    return jsonify({'ok': True})

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'reels': len(load_reels())})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=False)
