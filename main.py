from fastapi import FastAPI, Request, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from datetime import datetime, timedelta
from models import User, Facultati, Cadre, Secretariat, Admin, Sefgrupe, Disciplina, Subgrupe  # Modelul tău SQLAlchemy
from database import SessionLocal, engine, Base  # DB setup
from fastapi.templating import Jinja2Templates
import pandas as pd
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
        # ✅ 1. Verificare token Google
        idinfo = id_token.verify_oauth2_token(
            google_token,
            GoogleRequest(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]

        # ✅ 2. Căutăm în fiecare tabel
        cadru = db.query(Cadre).filter(Cadre.emailAddress == email).first()
        sec = db.query(Secretariat).filter(Secretariat.emailAddress == email).first()
        admin = db.query(Admin).filter(Admin.emailAddress == email).first()
        sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == email).first()

        if cadru:
            role = "cadru"
            full_name = f"{cadru.firstName} {cadru.lastName}"
        elif sec:
            role = "secretariat"
            full_name = f"{sec.firstName} {sec.lastName}"
        elif admin:
            role = "admin"
            full_name = f"{admin.firstName} {admin.lastName}"
        elif sef:
            role = "sef_grupa"
            full_name = f"{sef.firstName} {sef.lastName}"
        else:
            raise HTTPException(status_code=403, detail="Emailul nu este înregistrat în sistem")

        # ✅ 3. Creează sau actualizează user-ul
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, role=role)
            db.add(user)
        else:
            user.role = role  # update rol dacă s-a schimbat
        db.commit()
        db.refresh(user)

        # ✅ 4. Creează token JWT
        token_data = {
            "sub": user.email,
            "role": user.role
        }
        access_token = create_access_token(data=token_data)

        # ✅ 5. Salvează în cookie și redirecționează
        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie(key="access_token", value=access_token, httponly=True)

        return response

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token Google invalid: {str(e)}")
    except Exception as e:
        print("Eroare /token:", e)
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

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        return RedirectResponse(url="/login")

    user = db.query(User).filter(User.email == email).first()

    # Caută numele din toate tabelele
    full_name = None
    for table in [Cadre, Secretariat, Admin, Sefgrupe]:
        persoana = db.query(table).filter(table.emailAddress == email).first()
        if persoana:
            full_name = f"{persoana.firstName} {persoana.lastName}"
            break

    return templates.TemplateResponse("home.html", {
        "request": request,
        "user": user,
        "full_name": full_name
    })

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("access_token")
    return response

@app.get("/upload-discipline", response_class=HTMLResponse)
async def upload_page(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")

    if not token:
        return RedirectResponse(url="/login")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        return RedirectResponse(url="/login")

    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != "secretariat":
        raise HTTPException(status_code=403, detail="Acces interzis")

    return templates.TemplateResponse("upload_discipline.html", {
        "request": request
    })


@app.post("/upload-discipline")
async def handle_upload_discipline(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Token lipsă")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Token invalid")

    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != "secretariat":
        raise HTTPException(status_code=403, detail="Doar secretariatul poate încărca")

    # ✅ Procesăm fișierul Excel
    contents = await file.read()
    df = pd.read_excel(contents)

    # Exemplu de debug:
    for _, row in df.iterrows():

        subgrupa = db.query(Subgrupe).filter(Subgrupe.groupName == str(row["grupa"])).first()
        cadru = db.query(Cadre).filter(Cadre.emailAddress == row["email"]).first()
        print(row.to_dict())  # verificare în consolă

        disciplina = Disciplina(
            nume=row["disciplina"],   # << asigură-te că Excel are această coloană exact!
            an=row["an"],
            grupa=row["grupa"],
            titular=row["titular"],
            email=row["email"]
        )
        db.add(disciplina)
    db.commit()
    return {"message": "Fișier procesat cu succes!"}


@app.get("/discipline/")
def list_discipline(db: Session = Depends(get_db)):
    return db.query(Disciplina).all()
