from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from models import BlogPost, User
from forms import BlogPostForm
from app import db
from utils import save_image

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    category = request.args.get('category', None)
    
    # Base query
    query = BlogPost.query.filter_by(published=True)
    
    # Apply category filter if provided
    if category:
        query = query.filter_by(category=category)
        
    # Get paginated results
    posts = query.order_by(BlogPost.created_at.desc()).paginate(page=page, per_page=6)
    
    # Get all categories for filter dropdown
    categories = db.session.query(BlogPost.category).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    return render_template('blog/index.html', posts=posts, current_category=category, categories=categories)

@blog_bp.route('/<slug>')
def post(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    
    # Get related posts (same category)
    related_posts = BlogPost.query.filter(
        BlogPost.category == post.category,
        BlogPost.id != post.id,
        BlogPost.published == True
    ).order_by(BlogPost.created_at.desc()).limit(3).all()
    
    return render_template('blog/post.html', post=post, related_posts=related_posts)

@blog_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    # Allow any authenticated user to create a blog post
    form = BlogPostForm()
    
    if form.validate_on_submit():
        post = BlogPost(
            title=form.title.data,
            content=form.content.data,
            category=form.category.data,
            published=form.published.data,
            user_id=current_user.id
        )
        
        # Save image if uploaded
        if form.featured_image.data and hasattr(form.featured_image.data, 'filename'):
            featured_image = save_image(form.featured_image.data, folder='uploads/blog', resize=(1200, 800))
            post.featured_image = featured_image
        
        db.session.add(post)
        db.session.commit()
        
        flash('Blog post created successfully!', 'success')
        return redirect(url_for('blog.post', slug=post.slug))
    
    return render_template('blog/create.html', form=form, title='Create Blog Post')

@blog_bp.route('/<slug>/edit', methods=['GET', 'POST'])
@login_required
def edit(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    
    # Check if user is admin or the author of the post
    if not current_user.is_admin and post.user_id != current_user.id:
        abort(403)
        
    form = BlogPostForm(obj=post)
    
    if form.validate_on_submit():
        post.title = form.title.data
        post.content = form.content.data
        post.category = form.category.data
        post.published = form.published.data
        
        # Save image if uploaded
        if form.featured_image.data and hasattr(form.featured_image.data, 'filename'):
            featured_image = save_image(form.featured_image.data, folder='uploads/blog', resize=(1200, 800))
            post.featured_image = featured_image
        
        db.session.commit()
        
        flash('Blog post updated successfully!', 'success')
        return redirect(url_for('blog.post', slug=post.slug))
    
    return render_template('blog/edit.html', form=form, post=post, title='Edit Blog Post')

@blog_bp.route('/<slug>/delete', methods=['POST'])
@login_required
def delete(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    
    # Check if user is admin or the author of the post
    if not current_user.is_admin and post.user_id != current_user.id:
        abort(403)
        
    db.session.delete(post)
    db.session.commit()
    
    flash('Blog post deleted successfully!', 'success')
    return redirect(url_for('blog.index'))
