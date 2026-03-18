from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import mongo, bcrypt
from config import Config
from bson import ObjectId
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)


def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))


# ── POST /api/auth/register ────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name       = data.get('name', '').strip()
    email      = data.get('email', '').strip().lower()
    password   = data.get('password', '')
    admin_code = data.get('adminCode', '').strip()

    # Validation
    if not all([name, email, password]):
        return jsonify({'error': 'Name, email, and password are required.'}), 400
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email address.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    # Duplicate check
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'error': 'Email is already registered.'}), 409

    # Role
    role = 'admin' if admin_code == Config.ADMIN_CODE else 'user'

    # Hash & save
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user_doc = {
        'name':       name,
        'email':      email,
        'password':   pw_hash,
        'role':       role,
        'created_at': datetime.utcnow()
    }
    result = mongo.db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(identity=user_id)
    return jsonify({
        'token': token,
        'user':  {'id': user_id, 'name': name, 'email': email, 'role': role}
    }), 201


# ── POST /api/auth/login ───────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = mongo.db.users.find_one({'email': email})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'token': token,
        'user':  {
            'id':    str(user['_id']),
            'name':  user['name'],
            'email': user['email'],
            'role':  user['role']
        }
    })


# ── GET /api/auth/me ───────────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({
        'id':    str(user['_id']),
        'name':  user['name'],
        'email': user['email'],
        'role':  user['role']
    })
