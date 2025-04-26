from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from models import ContactMessage
from forms import ContactForm
from app import db

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/', methods=['GET', 'POST'])
def index():
    form = ContactForm()
    
    if form.validate_on_submit():
        message = ContactMessage(
            name=form.name.data,
            email=form.email.data,
            subject=form.subject.data,
            message=form.message.data
        )
        
        db.session.add(message)
        db.session.commit()
        
        flash('Your message has been sent! We will get back to you soon.', 'success')
        return redirect(url_for('contact.index'))
    
    return render_template('contact.html', form=form)

@contact_bp.route('/messages')
@login_required
def messages():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home.index'))
        
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return render_template('admin/messages.html', messages=messages)

@contact_bp.route('/messages/<int:id>/delete', methods=['POST'])
@login_required
def delete_message(id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('home.index'))
        
    message = ContactMessage.query.get_or_404(id)
    db.session.delete(message)
    db.session.commit()
    
    flash('Message deleted successfully!', 'success')
    return redirect(url_for('contact.messages'))
