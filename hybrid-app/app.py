from flask import Flask, send_from_directory, render_template
from extensions import mongo, jwt, bcrypt, cors
from config import Config
import os


def create_app():
    app = Flask(__name__,
                template_folder='templates',
                static_folder='static')
    app.config.from_object(Config)

    # Ensure uploads folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Init extensions
    mongo.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from routes.auth    import auth_bp
    from routes.videos  import videos_bp
    from routes.contact import contact_bp

    app.register_blueprint(auth_bp,    url_prefix='/api/auth')
    app.register_blueprint(videos_bp,  url_prefix='/api/videos')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')

    # Serve uploaded video files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Serve the frontend SPA
    @app.route('/')
    def index():
        return render_template('index.html')

    return app
