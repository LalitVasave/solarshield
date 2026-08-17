"""
Seed Admin — creates the first admin user.
Run once after seeding the farm.

Usage:
    python scripts/seed_admin.py
    python scripts/seed_admin.py --username admin --password mypassword
"""
import sys
import os
import argparse
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.user import User
import app.models
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)

parser = argparse.ArgumentParser(description="Create admin user")
parser.add_argument("--username", default="admin")
parser.add_argument("--password", default="solarshield2024!")
args = parser.parse_args()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()
try:
    if db.query(User).filter(User.username == args.username).first():
        print(f"User '{args.username}' already exists. Skipping.")
    else:
        user = User(
            username=args.username,
            hashed_password=pwd_context.hash(args.password),
            is_admin=True,
            is_active=True,
        )
        db.add(user)
        db.commit()
        print(f"✅ Admin user '{args.username}' created")
        print(f"   Password: {args.password}")
        print(f"   Login:    POST /auth/token  username={args.username} password={args.password}")
finally:
    db.close()
