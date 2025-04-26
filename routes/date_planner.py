from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import login_required, current_user
from models import DateIdea
from forms import DateIdeaForm
from app import db
from utils import save_image

date_planner_bp = Blueprint('date_planner', __name__)

@date_planner_bp.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    budget = request.args.get('budget')
    activity_type = request.args.get('activity_type')
    location = request.args.get('location')
    
    # Base query
    query = DateIdea.query
    
    # Apply filters if provided
    if budget:
        query = query.filter_by(budget=budget)
    if activity_type:
        query = query.filter_by(activity_type=activity_type)
    if location:
        query = query.filter(DateIdea.location.ilike(f'%{location}%'))
        
    # Get paginated results
    date_ideas = query.order_by(DateIdea.created_at.desc()).paginate(page=page, per_page=9)
    
    # Get all budgets, activity types, and locations for filter dropdowns
    budgets = db.session.query(DateIdea.budget).distinct().all()
    budgets = [b[0] for b in budgets if b[0]]
    
    activity_types = db.session.query(DateIdea.activity_type).distinct().all()
    activity_types = [a[0] for a in activity_types if a[0]]
    
    locations = db.session.query(DateIdea.location).distinct().all()
    locations = [l[0] for l in locations if l[0]]
    
    return render_template(
        'date_planner/index.html',
        date_ideas=date_ideas,
        budgets=budgets,
        activity_types=activity_types,
        locations=locations,
        current_budget=budget,
        current_activity_type=activity_type,
        current_location=location
    )

@date_planner_bp.route('/<int:id>')
def detail(id):
    date_idea = DateIdea.query.get_or_404(id)
    
    # Get similar date ideas (same budget or activity type)
    similar_ideas = DateIdea.query.filter(
        (DateIdea.budget == date_idea.budget) | (DateIdea.activity_type == date_idea.activity_type),
        DateIdea.id != date_idea.id
    ).order_by(DateIdea.created_at.desc()).limit(3).all()
    
    return render_template('date_planner/detail.html', date_idea=date_idea, similar_ideas=similar_ideas)

@date_planner_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = DateIdeaForm()
    
    if form.validate_on_submit():
        date_idea = DateIdea(
            title=form.title.data,
            description=form.description.data,
            location=form.location.data,
            budget=form.budget.data,
            activity_type=form.activity_type.data,
            user_id=current_user.id
        )
        
        # Save image if uploaded
        if form.image.data:
            image = save_image(form.image.data, folder='uploads/date_ideas', resize=(800, 600))
            date_idea.image = image
        
        db.session.add(date_idea)
        db.session.commit()
        
        flash('Date idea created successfully!', 'success')
        return redirect(url_for('date_planner.detail', id=date_idea.id))
    
    return render_template('date_planner/create.html', form=form, title='Create Date Idea')

@date_planner_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit(id):
    date_idea = DateIdea.query.get_or_404(id)
    
    # Check if user is admin or creator
    if not current_user.is_admin and date_idea.user_id != current_user.id:
        abort(403)
        
    form = DateIdeaForm(obj=date_idea)
    
    if form.validate_on_submit():
        date_idea.title = form.title.data
        date_idea.description = form.description.data
        date_idea.location = form.location.data
        date_idea.budget = form.budget.data
        date_idea.activity_type = form.activity_type.data
        
        # Save image if uploaded
        if form.image.data:
            image = save_image(form.image.data, folder='uploads/date_ideas', resize=(800, 600))
            date_idea.image = image
        
        db.session.commit()
        
        flash('Date idea updated successfully!', 'success')
        return redirect(url_for('date_planner.detail', id=date_idea.id))
    
    return render_template('date_planner/create.html', form=form, date_idea=date_idea, title='Edit Date Idea')

@date_planner_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    date_idea = DateIdea.query.get_or_404(id)
    
    # Check if user is admin or creator
    if not current_user.is_admin and date_idea.user_id != current_user.id:
        abort(403)
        
    db.session.delete(date_idea)
    db.session.commit()
    
    flash('Date idea deleted successfully!', 'success')
    return redirect(url_for('date_planner.index'))
