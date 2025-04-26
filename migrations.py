from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, upgrade
from sqlalchemy import text
import os
from app import app, db
from models import User, BlogPost, DateIdea, Photo, Event, ContactMessage

# Already initialized in app.py
migrate = Migrate(app, db)

def run_migrations():
    """Run database migrations programmatically"""
    with app.app_context():
        # Add the media_type column to the Photo table if it doesn't exist
        try:
            db.session.execute(text('ALTER TABLE photo ADD COLUMN media_type VARCHAR(10) DEFAULT "image"'))
            db.session.commit()
            print("Added media_type column to Photo table")
        except Exception as e:
            # If the column already exists or other error
            db.session.rollback()
            print(f"Note: {str(e)}")

if __name__ == '__main__':
    run_migrations()