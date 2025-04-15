from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime, timedelta
from models import User, Facultati  # Modelul tău SQLAlchemy
from database import SessionLocal, engine, Base  # DB setup
from fastapi.templating import Jinja2Templates
import jwt
import os
import time

# Inițializare aplicație
app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Configurări
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-puternică")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "916798165835-86eqcj4m9333a8m9idsp5unk2d4cbhge.apps.googleusercontent.com")

# Creează tabelele (dacă nu există)
Base.metadata.create_all(bind=engine)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

    
    
# Securitate
security = HTTPBearer()

# Generează token JWT
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Obține utilizatorul curent
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=403, detail="Token invalid")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expirat")
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Token invalid sau corupt")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există")
    return user

# Endpoint: Login cu Google
@app.post("/token")
async def handle_google_token(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    google_token = data.get("token")

    if not google_token:
        raise HTTPException(status_code=400, detail="Token Google lipsă")

    try:
        # Validare token Google
        idinfo = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]

        # Caută sau creează utilizatorul
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, role="secretariat")
            db.add(user)
            db.commit()
            db.refresh(user)

        # Creează JWT
        token_data = {"sub": user.email, "role": user.role}
        access_token = create_access_token(data=token_data)

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token Google invalid: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eroare server: {str(e)}")

# Endpoint: Pagina de login
@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {
        "request": request,
        "google_client_id": GOOGLE_CLIENT_ID
    })

# Endpoint: Dashboard
@app.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user)):
    return {"message": f"Bun venit, {current_user.email}!"}

# Endpoint: Date utilizator
@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "role": current_user.role
    }

# Endpoint: Timp server (debug/sincronizare)
@app.get("/server-time")
async def get_server_time():
    return {
        "timestamp": int(time.time()),
        "datetime": str(datetime.utcnow()),
        "timezone": str(datetime.now().astimezone().tzinfo)
    }

@app.get("/facultati/")
def list_facultati(db: Session = Depends(get_db)):
    return db.query(Facultati).all()
