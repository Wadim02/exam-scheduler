"""
Module for user authentication using Google OAuth2 token.

This module validates the JWT token received from Google, extracts user
information, and determines the role based on the email address.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# ===============================
# Google OAuth2 Configuration
# ===============================

# Retrieve Client ID from environment variables
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

# Authentication scheme using Bearer token
scheme = HTTPBearer()

# ===============================
# Functions
# ===============================

def verify_google_token(token: str) -> dict:
    """
    Verifies the validity of a Google token and returns identification information.

    :param token: Google JWT token received from the client
    :return: Dictionary with user information
    :raises HTTPException: If the token is invalid
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Check if the token has a valid issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError("Incorrect issuer")

        return idinfo

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(scheme)) -> dict:
    """
    Returns information about the currently authenticated user.

    :param credentials: HTTPAuthorizationCredentials object automatically extracted by FastAPI
    :return: Dictionary with user data
    :raises HTTPException: If the email domain is not allowed
    """
    token = credentials.credentials
    user_info = verify_google_token(token)

    # Allow only specific domain emails
    if not user_info['email'].endswith(('@usm.ro', '@student.usv.ro')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized email domain"
        )

    return user_info

def get_role_based_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Assigns a role to the current user based on their email address.

    :param current_user: Dictionary with authenticated user data
    :return: Same dictionary with the `role` key added
    """
    email = current_user['email']

    # Assign role based on email domain
    if '@usm.ro' in email:
        current_user['role'] = 'teacher'
    elif '@student.usv.ro' in email:
        current_user['role'] = 'group_leader'
    else:
        current_user['role'] = 'secretariat'

    return current_user