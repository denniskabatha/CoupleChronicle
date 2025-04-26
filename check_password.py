from app import app, db
from models import User
from werkzeug.security import check_password_hash, generate_password_hash

with app.app_context():
    # Check Maryann's password
    maryann = User.query.filter_by(username='Maryann').first()
    if maryann:
        print(f"Maryann's password hash: {maryann.password_hash}")
        
        # Try to verify with expected password
        test_password = "njokiyunabi@"
        is_valid = check_password_hash(maryann.password_hash, test_password)
        print(f"Password 'njokiyunabi@' valid: {is_valid}")
        
        # Generate a new hash for comparison
        new_hash = generate_password_hash(test_password)
        print(f"Newly generated hash: {new_hash}")
    else:
        print("Maryann not found in database")
        
    # Check Dennis's password too for comparison
    dennis = User.query.filter_by(username='Dennis').first()
    if dennis:
        print(f"\nDennis's password hash: {dennis.password_hash}")
        
        # Try to verify with expected password
        test_password = "kabatha123@"
        is_valid = check_password_hash(dennis.password_hash, test_password)
        print(f"Password 'kabatha123@' valid: {is_valid}")
    else:
        print("Dennis not found in database")