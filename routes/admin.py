from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from models import User, BlogPost, DateIdea, Photo, Event, ContactMessage
from forms import LoginForm
from app import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
        
    form = LoginForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            flash('Login successful!', 'success')
            return redirect(next_page or url_for('admin.dashboard'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('admin/login.html', form=form)

@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home.index'))

@admin_bp.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home.index'))
    
    # Get counts for dashboard stats
    blog_count = BlogPost.query.count()
    date_idea_count = DateIdea.query.count()
    photo_count = Photo.query.count()
    event_count = Event.query.count()
    message_count = ContactMessage.query.count()
    
    # Get recent blog posts
    recent_posts = BlogPost.query.order_by(BlogPost.created_at.desc()).limit(5).all()
    
    # Get recent messages
    recent_messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(5).all()
    
    # Get upcoming events
    upcoming_events = Event.query.filter(Event.start_date >= db.func.current_timestamp()).order_by(Event.start_date).limit(5).all()
    
    return render_template(
        'admin/dashboard.html',
        blog_count=blog_count,
        date_idea_count=date_idea_count,
        photo_count=photo_count,
        event_count=event_count,
        message_count=message_count,
        recent_posts=recent_posts,
        recent_messages=recent_messages,
        upcoming_events=upcoming_events
    )
