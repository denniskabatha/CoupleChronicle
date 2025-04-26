from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from models import Photo
from forms import PhotoUploadForm
from app import db
from utils import save_media, save_image
import os

gallery_bp = Blueprint('gallery', __name__)

@gallery_bp.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    photos = Photo.query.order_by(Photo.created_at.desc()).paginate(page=page, per_page=12)
    return render_template('gallery/index.html', photos=photos)

@gallery_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    form = PhotoUploadForm()
    
    if form.validate_on_submit():
        media_type = form.media_type.data
        
        photo = Photo(
            title=form.title.data,
            description=form.description.data,
            user_id=current_user.id,
            media_type=media_type
        )
        
        # Save uploaded media (photo or video)
        if form.photo.data and hasattr(form.photo.data, 'filename'):
            # For images, resize; for videos, just save as is
            if media_type == 'image':
                filename = save_media(form.photo.data, folder='uploads/gallery', resize=(1200, 900), media_type='image')
            else:
                filename = save_media(form.photo.data, folder='uploads/gallery', media_type='video')
                
            photo.filename = filename
        
        db.session.add(photo)
        db.session.commit()
        
        flash(f'{"Photo" if media_type == "image" else "Video"} uploaded successfully!', 'success')
        return redirect(url_for('gallery.index'))
    
    return render_template('gallery/upload.html', form=form)

@gallery_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    photo = Photo.query.get_or_404(id)
    
    # Check if user is admin or uploader
    if not current_user.is_admin and photo.user_id != current_user.id:
        abort(403)
        
    db.session.delete(photo)
    db.session.commit()
    
    flash('Photo deleted successfully!', 'success')
    return redirect(url_for('gallery.index'))
