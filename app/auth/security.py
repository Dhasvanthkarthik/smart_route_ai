import os
import secrets
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import domain

# Configurations
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for demo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_opaque_token():
    return secrets.token_urlsafe(32)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Find token in database
    db_token = db.query(domain.OpaqueToken).filter(domain.OpaqueToken.token_string == token).first()
    
    if not db_token:
        raise credentials_exception
        
    # Check expiration
    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        db.delete(db_token)
        db.commit()
        raise credentials_exception
        
    # Return the user object
    user = db.query(domain.User).filter(domain.User.id == db_token.user_id).first()
    if user is None:
        raise credentials_exception
        
    return user
