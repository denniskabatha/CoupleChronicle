from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, PasswordField, BooleanField, SelectField, DateTimeField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional
from flask_wtf.file import FileField, FileAllowed


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')


class BlogPostForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(min=3, max=120)])
    content = TextAreaField('Content', validators=[DataRequired()])
    category = SelectField('Category', choices=[
        ('relationship', 'Relationship'),
        ('travel', 'Travel'),
        ('tips', 'Tips & Advice'),
        ('memories', 'Memories'),
        ('other', 'Other')
    ])
    featured_image = FileField('Featured Image', validators=[
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Images only!')
    ])
    published = BooleanField('Publish', default=True)


class DateIdeaForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(min=3, max=120)])
    description = TextAreaField('Description', validators=[DataRequired()])
    location = StringField('Location', validators=[Optional(), Length(max=120)])
    budget = SelectField('Budget', choices=[
        ('low', 'Low (Under $20)'),
        ('medium', 'Medium ($20-$50)'),
        ('high', 'High ($50+)')
    ])
    activity_type = SelectField('Activity Type', choices=[
        ('outdoor', 'Outdoor'),
        ('indoor', 'Indoor'),
        ('restaurant', 'Restaurant/Dining'),
        ('movie', 'Movie/Theater'),
        ('adventure', 'Adventure'),
        ('relaxation', 'Relaxation'),
        ('staycation', 'Staycation'),
        ('other', 'Other')
    ])
    image = FileField('Image', validators=[
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Images only!')
    ])


class PhotoUploadForm(FlaskForm):
    title = StringField('Title', validators=[Optional(), Length(max=120)])
    description = TextAreaField('Description', validators=[Optional()])
    photo = FileField('Photo', validators=[
        DataRequired(),
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Images only!')
    ])


class EventForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(min=3, max=120)])
    description = TextAreaField('Description', validators=[Optional()])
    start_date = DateTimeField('Start Date/Time', format='%Y-%m-%dT%H:%M', validators=[DataRequired()])
    end_date = DateTimeField('End Date/Time', format='%Y-%m-%dT%H:%M', validators=[Optional()])
    all_day = BooleanField('All Day Event')
    location = StringField('Location', validators=[Optional(), Length(max=120)])
    event_type = SelectField('Event Type', choices=[
        ('anniversary', 'Anniversary'),
        ('date', 'Date Night'),
        ('birthday', 'Birthday'),
        ('special', 'Special Occasion'),
        ('other', 'Other')
    ])


class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(min=2, max=120)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    subject = StringField('Subject', validators=[DataRequired(), Length(min=3, max=120)])
    message = TextAreaField('Message', validators=[DataRequired()])
