import os
import logging
from datetime import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_login import LoginManager
from flask_migrate import Migrate


# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Import utils for custom filters
from utils import format_date, format_datetime, get_event_color

# Register custom template filters
app.jinja_env.filters['format_date'] = format_date
app.jinja_env.filters['format_datetime'] = format_datetime
app.jinja_env.filters['event_color'] = get_event_color

# Configure the database - using SQLite by default
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///couple_blog.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "static/uploads")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max upload

# Add context processor for datetime
@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Set up login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login'

# Create upload directory if it doesn't exist
os.makedirs(os.path.join(app.root_path, "static/uploads/gallery"), exist_ok=True)

with app.app_context():
    # Import models
    from models import User, BlogPost, DateIdea, Photo, Event
    
    # Import routes
    from routes.home import home_bp
    from routes.blog import blog_bp
    from routes.date_planner import date_planner_bp
    from routes.gallery import gallery_bp
    from routes.calendar import calendar_bp
    from routes.admin import admin_bp
    from routes.contact import contact_bp
    
    # Register blueprints
    app.register_blueprint(home_bp)
    app.register_blueprint(blog_bp, url_prefix='/blog')
    app.register_blueprint(date_planner_bp, url_prefix='/date-planner')
    app.register_blueprint(gallery_bp, url_prefix='/gallery')
    app.register_blueprint(calendar_bp, url_prefix='/calendar')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(contact_bp, url_prefix='/contact')
    
    # Create database tables
    db.create_all()

    # Check if admin user exists, create if not
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        from werkzeug.security import generate_password_hash
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        logging.info("Admin user created")

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))
