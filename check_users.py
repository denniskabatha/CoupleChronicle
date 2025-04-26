from app import app, db
from models import User

with app.app_context():
    users = User.query.all()
    print('===== Users in database: =====')
    for u in users:
        print(f'ID: {u.id}, Username: {u.username}, Email: {u.email}, Admin: {u.is_admin}')