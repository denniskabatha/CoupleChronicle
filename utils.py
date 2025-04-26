import os
import secrets
from PIL import Image
from datetime import datetime
from flask import current_app


def save_image(file, folder='uploads', resize=None):
    """
    Save uploaded image file with a random filename
    
    Args:
        file: The uploaded file object
        folder: The subfolder to save to within static folder
        resize: A tuple (width, height) to resize the image
        
    Returns:
        The filename of the saved image
    """
    random_hex = secrets.token_hex(8)
    _, file_ext = os.path.splitext(file.filename)
    filename = random_hex + file_ext
    
    # Create directory if it doesn't exist
    save_path = os.path.join(current_app.root_path, 'static', folder)
    os.makedirs(save_path, exist_ok=True)
    
    file_path = os.path.join(save_path, filename)
    
    # Optionally resize the image
    if resize:
        image = Image.open(file)
        image.thumbnail(resize)
        image.save(file_path)
    else:
        file.save(file_path)
    
    return os.path.join(folder, filename)


def format_date(date):
    """Format datetime object to a readable string"""
    return date.strftime('%B %d, %Y')


def format_datetime(date):
    """Format datetime object to a readable string with time"""
    return date.strftime('%B %d, %Y at %I:%M %p')


def get_event_color(event_type):
    """Return a color for calendar events based on type"""
    colors = {
        'anniversary': '#FF6B6B',  # Coral red
        'date': '#4ECDC4',         # Turquoise
        'birthday': '#FFD166',     # Yellow
        'special': '#9370DB',      # Medium purple
        'other': '#6B7A8F'         # Slate gray
    }
    return colors.get(event_type, '#6B7A8F')  # Default to slate gray
