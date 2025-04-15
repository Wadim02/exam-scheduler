from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# Configure Google OAuth
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
scheme = HTTPBearer()

async def verify_google_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Validate token
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError("Wrong issuer")
            
        return idinfo
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(scheme)):
    token = credentials.credentials
    user_info = verify_google_token(token)
    
    # Check if user email is from valid domain
    if not user_info['email'].endswith(('@usm.ro', '@student.usv.ro')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid email domain"
        )
    
    return user_info

def get_role_based_user(current_user: dict = Depends(get_current_user)):
    email = current_user['email']
    # Determine role based on email domain
    if '@usm.ro' in email:
        current_user['role'] = 'teacher'
    elif '@student.usv.ro' in email:
        current_user['role'] = 'group_leader'
    else:
        current_user['role'] = 'secretariat'
    
    return current_user
