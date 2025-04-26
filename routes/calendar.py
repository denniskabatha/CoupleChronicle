from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import login_required, current_user
from models import Event
from forms import EventForm
from app import db
from utils import get_event_color
from datetime import datetime

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/')
def index():
    return render_template('calendar/index.html')

@calendar_bp.route('/events')
def get_events():
    start = request.args.get('start')
    end = request.args.get('end')
    
    if start and end:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
        
        events = Event.query.filter(
            (Event.start_date >= start_date) & (Event.start_date <= end_date)
        ).all()
    else:
        events = Event.query.all()
    
    event_list = []
    for event in events:
        event_data = {
            'id': event.id,
            'title': event.title,
            'start': event.start_date.isoformat(),
            'allDay': event.all_day,
            'backgroundColor': get_event_color(event.event_type),
            'borderColor': get_event_color(event.event_type),
            'description': event.description,
            'location': event.location,
            'event_type': event.event_type
        }
        
        if event.end_date:
            event_data['end'] = event.end_date.isoformat()
            
        event_list.append(event_data)
    
    return jsonify(event_list)

@calendar_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = EventForm()
    
    if form.validate_on_submit():
        event = Event(
            title=form.title.data,
            description=form.description.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
            all_day=form.all_day.data,
            location=form.location.data,
            event_type=form.event_type.data,
            user_id=current_user.id
        )
        
        db.session.add(event)
        db.session.commit()
        
        flash('Event created successfully!', 'success')
        return redirect(url_for('calendar.index'))
    
    return render_template('calendar/create.html', form=form, title='Create Event')

@calendar_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit(id):
    event = Event.query.get_or_404(id)
    
    # Check if user is admin or creator
    if not current_user.is_admin and event.user_id != current_user.id:
        abort(403)
        
    form = EventForm(obj=event)
    
    if form.validate_on_submit():
        event.title = form.title.data
        event.description = form.description.data
        event.start_date = form.start_date.data
        event.end_date = form.end_date.data
        event.all_day = form.all_day.data
        event.location = form.location.data
        event.event_type = form.event_type.data
        
        db.session.commit()
        
        flash('Event updated successfully!', 'success')
        return redirect(url_for('calendar.index'))
    
    return render_template('calendar/create.html', form=form, event=event, title='Edit Event')

@calendar_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    event = Event.query.get_or_404(id)
    
    # Check if user is admin or creator
    if not current_user.is_admin and event.user_id != current_user.id:
        abort(403)
        
    db.session.delete(event)
    db.session.commit()
    
    flash('Event deleted successfully!', 'success')
    return redirect(url_for('calendar.index'))
