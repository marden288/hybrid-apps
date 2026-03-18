from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import mongo
from config import Config
from bson import ObjectId
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import uuid

videos_bp = Blueprint('videos', __name__)


# ── Helpers ────────────────────────────────────────────────────────
def allowed_file(filename: str) -> bool:
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS)


def serialize_video(v: dict) -> dict:
    v['id']  = str(v.pop('_id'))
    if 'created_at' in v:
        v['created_at'] = v['created_at'].isoformat()
    return v


def get_current_admin():
    """Return the current user doc if admin, else None."""
    try:
        verify_jwt_in_request()
        uid  = get_jwt_identity()
        user = mongo.db.users.find_one({'_id': ObjectId(uid)})
        return user if user and user.get('role') == 'admin' else None
    except Exception:
        return None


def seed_sample_videos():
    """Insert sample videos on first run."""
    if mongo.db.videos.count_documents({}) == 0:
        samples = [
            {
                'title':      'Frame Assembly — Week 1',
                'description':'Building the metal frame for solar panels',
                'videoUrl':   'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'category':   'assembly',
                'uploader':   'Rhey Victor',
                'date':       '2026-03-01',
                'views':      45,
                'isExternal': True,
                'created_at': datetime.utcnow()
            },
            {
                'title':      'Arduino Programming',
                'description':'Coding the anti-theft system logic',
                'videoUrl':   'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                'category':   'electronics',
                'uploader':   'Marden',
                'date':       '2026-03-05',
                'views':      78,
                'isExternal': True,
                'created_at': datetime.utcnow()
            },
            {
                'title':      'Solenoid Lock Testing',
                'description':'Testing the anti-theft mechanism',
                'videoUrl':   'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'category':   'security',
                'uploader':   'Victor',
                'date':       '2026-03-10',
                'views':      62,
                'isExternal': True,
                'created_at': datetime.utcnow()
            }
        ]
        mongo.db.videos.insert_many(samples)


# ── GET /api/videos/ ──────────────────────────────────────────────
@videos_bp.route('/', methods=['GET'])
def get_videos():
    seed_sample_videos()
    category = request.args.get('category')
    query    = {'category': category} if category else {}
    videos   = list(mongo.db.videos.find(query).sort('created_at', -1))
    return jsonify([serialize_video(v) for v in videos])


# ── POST /api/videos/ — admin only ───────────────────────────────
@videos_bp.route('/', methods=['POST'])
@jwt_required()
def upload_video():
    uid  = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(uid)})
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required.'}), 403

    title    = request.form.get('title', '').strip()
    desc     = request.form.get('description', '').strip()
    category = request.form.get('category', 'other')
    uploader = request.form.get('uploader', user['name'])

    if not title:
        return jsonify({'error': 'Title is required.'}), 400

    file = request.files.get('video')
    if not file or file.filename == '':
        return jsonify({'error': 'Video file is required.'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use MP4, WebM, or MOV.'}), 400

    ext      = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))

    video_doc = {
        'title':       title,
        'description': desc or 'Project video',
        'videoUrl':    f'/uploads/{filename}',
        'category':    category,
        'uploader':    uploader,
        'date':        datetime.utcnow().strftime('%Y-%m-%d'),
        'views':       0,
        'isExternal':  False,
        'created_at':  datetime.utcnow()
    }
    result = mongo.db.videos.insert_one(video_doc)
    video_doc['id'] = str(result.inserted_id)
    del video_doc['_id']
    video_doc['created_at'] = video_doc['created_at'].isoformat()

    return jsonify(video_doc), 201


# ── DELETE /api/videos/<id> — admin only ─────────────────────────
@videos_bp.route('/<video_id>', methods=['DELETE'])
@jwt_required()
def delete_video(video_id):
    uid  = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(uid)})
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required.'}), 403

    try:
        video = mongo.db.videos.find_one({'_id': ObjectId(video_id)})
    except Exception:
        return jsonify({'error': 'Invalid video ID.'}), 400

    if not video:
        return jsonify({'error': 'Video not found.'}), 404

    # Delete local file if not external
    if not video.get('isExternal'):
        filepath = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            os.path.basename(video['videoUrl'])
        )
        if os.path.exists(filepath):
            os.remove(filepath)

    mongo.db.videos.delete_one({'_id': ObjectId(video_id)})
    return jsonify({'message': 'Video deleted successfully.'})


# ── PATCH /api/videos/<id>/view — increment view count ───────────
@videos_bp.route('/<video_id>/view', methods=['PATCH'])
def increment_view(video_id):
    try:
        mongo.db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'views': 1}}
        )
    except Exception:
        pass
    return jsonify({'message': 'View counted.'})
