"""
Modul pentru autentificarea utilizatorilor folosind tokenul Google OAuth2.

Acest modul validează tokenul JWT primit de la Google, extrage informațiile
despre utilizator și determină rolul pe baza adresei de email.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# ===============================
# Configurare OAuth2 Google
# ===============================

# Obține ID-ul clientului din variabilele de mediu
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

# Schema de autentificare folosind token Bearer
scheme = HTTPBearer()

# ===============================
# Funcții
# ===============================

async def verify_google_token(token: str) -> dict:
    """
    Verifică validitatea unui token Google și returnează informațiile de identificare.

    :param token: Tokenul JWT Google primit de la client
    :return: Dicționar cu informațiile despre utilizator
    :raises HTTPException: dacă tokenul este invalid
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Verifică dacă tokenul are un issuer valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError("Issuer incorect")

        return idinfo

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Google invalid"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(scheme)):
    """
    Returnează informațiile despre utilizatorul curent autentificat.

    :param credentials: Obiectul HTTPAuthorizationCredentials extras automat de FastAPI
    :return: Dicționar cu datele despre utilizator
    :raises HTTPException: dacă domeniul emailului este invalid
    """
    token = credentials.credentials
    user_info = verify_google_token(token)

    # Permite doar emailurile de domeniu specific
    if not user_info['email'].endswith(('@usm.ro', '@student.usv.ro')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Domeniu email nepermis"
        )

    return user_info

def get_role_based_user(current_user: dict = Depends(get_current_user)):
    """
    Asignează un rol utilizatorului curent pe baza adresei de email.

    :param current_user: Dicționar cu datele despre utilizatorul autentificat
    :return: Același dicționar, dar cu cheia `role` adăugată
    """
    email = current_user['email']

    # Asignează rolul în funcție de domeniul emailului
    if '@usm.ro' in email:
        current_user['role'] = 'teacher'
    elif '@student.usv.ro' in email:
        current_user['role'] = 'group_leader'
    else:
        current_user['role'] = 'secretariat'

    return current_user
