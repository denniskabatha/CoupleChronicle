from flask import Blueprint, render_template
from models import BlogPost, Photo, Event
from datetime import datetime, timedelta

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def index():
    # Get latest blog posts
    recent_posts = BlogPost.query.filter_by(published=True).order_by(BlogPost.created_at.desc()).limit(3).all()
    
    # Get featured photos
    featured_photos = Photo.query.order_by(Photo.created_at.desc()).limit(6).all()
    
    # Get upcoming events
    today = datetime.utcnow()
    next_month = today + timedelta(days=30)
    upcoming_events = Event.query.filter(
        Event.start_date >= today,
        Event.start_date <= next_month
    ).order_by(Event.start_date).limit(5).all()
    
    return render_template(
        'home.html',
        recent_posts=recent_posts,
        featured_photos=featured_photos,
        upcoming_events=upcoming_events,
        now=datetime.utcnow()
    )
