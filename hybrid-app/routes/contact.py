from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from bson import ObjectId
from datetime import datetime
import re

contact_bp = Blueprint('contact', __name__)


def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))


# ── POST /api/contact/ — send a message ──────────────────────────
@contact_bp.route('/', methods=['POST'])
def send_message():
    data    = request.get_json() or {}
    name    = data.get('name', '').strip()
    email   = data.get('email', '').strip().lower()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not all([name, email, subject, message]):
        return jsonify({'error': 'All fields are required.'}), 400
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email address.'}), 400

    doc = {
        'name':       name,
        'email':      email,
        'subject':    subject,
        'message':    message,
        'read':       False,
        'created_at': datetime.utcnow()
    }
    result = mongo.db.messages.insert_one(doc)
    return jsonify({'message': 'Message sent!', 'id': str(result.inserted_id)}), 201


# ── GET /api/contact/ — admin only ───────────────────────────────
@contact_bp.route('/', methods=['GET'])
@jwt_required()
def get_messages():
    uid  = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(uid)})
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required.'}), 403

    messages = list(mongo.db.messages.find().sort('created_at', -1))
    for m in messages:
        m['id']         = str(m.pop('_id'))
        m['created_at'] = m['created_at'].isoformat()
    return jsonify(messages)


# ── PATCH /api/contact/<id>/read — mark as read (admin) ──────────
@contact_bp.route('/<msg_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(msg_id):
    uid  = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(uid)})
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Admin access required.'}), 403
    try:
        mongo.db.messages.update_one(
            {'_id': ObjectId(msg_id)},
            {'$set': {'read': True}}
        )
    except Exception:
        return jsonify({'error': 'Invalid message ID.'}), 400
    return jsonify({'message': 'Marked as read.'})
