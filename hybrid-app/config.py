import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY          = os.getenv('SECRET_KEY', 'hybrid-secret-2026')
    MONGO_URI           = os.getenv('MONGO_URI', 'mongodb://localhost:27017/hybridstation')
    JWT_SECRET_KEY      = os.getenv('JWT_SECRET_KEY', 'jwt-hybrid-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    ADMIN_CODE          = os.getenv('ADMIN_CODE', 'ADMIN2026')
    GEMINI_API_KEY      = os.getenv('GEMINI_API_KEY', '')
    UPLOAD_FOLDER       = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH  = 200 * 1024 * 1024   # 200 MB max upload
    ALLOWED_EXTENSIONS  = {'mp4', 'webm', 'mov', 'avi', 'mkv'}
