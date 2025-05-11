"""
Modulul principal al aplicației ExamScheduler.

Conține toate endpointurile FastAPI, autentificarea Google, procesarea fișierelor Excel și 
rutele pentru dashboard și interfața utilizatorului.
"""
from dotenv import load_dotenv
load_dotenv()
from email_utils import trimite_email_sefi_grupa
from fastapi import FastAPI, Request, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from datetime import datetime, timedelta
from models import User, Facultati, Cadre, Secretariat, Admin, Sefgrupe, Disciplina, Subgrupe, PropunereExamen
from database import SessionLocal, engine, Base
from fastapi.templating import Jinja2Templates
import pandas as pd
import jwt
import os
import time
from io import BytesIO
from typing import Optional
from fastapi import Form


app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Configurații JWT și Google
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-puternică")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "client_id_default")

# Creează tabelele în baza de date dacă nu există
Base.metadata.create_all(bind=engine)

def get_db():
    """
    Creează o sesiune de DB pentru fiecare request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Creează un token JWT pentru autentificare.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
):
    """
    Extrage utilizatorul curent din JWT (din antet sau cookie).
    """
    token = None

    if credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

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

@app.post("/token")
async def handle_google_token(request: Request, db: Session = Depends(get_db)):
    """
    Procesează login-ul cu Google și creează token JWT.
    """
    data = await request.json()
    google_token = data.get("token")

    if not google_token:
        raise HTTPException(status_code=400, detail="Token Google lipsă")

    try:
        idinfo = id_token.verify_oauth2_token(
            google_token,
            GoogleRequest(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]

        # Verifică în toate tabelele cine este utilizatorul
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

        # Creează sau actualizează utilizatorul în tabela User
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, role=role)
            db.add(user)
        else:
            user.role = role
        db.commit()
        db.refresh(user)

        token_data = {
            "sub": user.email,
            "role": user.role
        }
        access_token = create_access_token(data=token_data)

        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie(key="access_token", value=access_token, httponly=True)

        return response

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token Google invalid: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eroare server: {str(e)}")

@app.get("/login")
async def login_page(request: Request):
    """
    Afișează pagina de autentificare.
    """
    return templates.TemplateResponse("login.html", {
        "request": request,
        "google_client_id": GOOGLE_CLIENT_ID
    })

@app.get("/dashboard")
async def dashboard(current_user: User = Depends(get_current_user)):
    """
    Pagina de dashboard, protejată cu autentificare.
    """
    return {"message": f"Bun venit, {current_user.email}!"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Returnează informații despre utilizatorul autentificat.
    """
    return {
        "email": current_user.email,
        "role": current_user.role
    }

@app.get("/server-time")
async def get_server_time():
    """
    Returnează timpul curent pe server (UTC și local).
    """
    return {
        "timestamp": int(time.time()),
        "datetime": str(datetime.utcnow()),
        "timezone": str(datetime.now().astimezone().tzinfo)
    }

@app.get("/facultati/")
def list_facultati(db: Session = Depends(get_db)):
    """
    Listează toate facultățile din baza de date.
    """
    return db.query(Facultati).all()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    """
    Pagina principală a aplicației. Verifică autentificarea și afișează numele utilizatorului.
    """
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        return RedirectResponse(url="/login")

    user = db.query(User).filter(User.email == email).first()

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
    """
    Șterge tokenul și redirecționează la pagina de login.
    """
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("access_token")
    return response

@app.get("/upload-discipline", response_class=HTMLResponse)
async def upload_page(request: Request, db: Session = Depends(get_db)):
    """
    Afișează formularul pentru încărcarea disciplinelor.
    Doar utilizatorii din secretariat au acces.
    """
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
    """
    Primește fișierul Excel cu discipline și le adaugă în baza de date,
    ștergând mai întâi toate înregistrările existente.
    """
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

    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))

    # 🔴 Ștergem toate disciplinele existente
    db.query(Disciplina).delete()
    db.commit()

    # ✅ Adăugăm disciplinele noi
    for _, row in df.iterrows():
        disciplina = Disciplina(
            nume=row["disciplina"],
            an=row["an"],
            grupa=row["grupa"],
            titular=row["titular"],
            email=row["email"]
        )
        db.add(disciplina)

    db.commit()

    # Trimitere emailuri la șefii de grupă (mock sau real)
    sefi = db.query(Sefgrupe).all()
    emailuri = [s.emailAddress for s in sefi]
    trimite_email_sefi_grupa(emailuri)

    return {"message": "Fișier procesat, disciplinele au fost actualizate și emailurile trimise!"}

@app.get("/propuneri")
async def vezi_discipline_sef_grupa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returnează disciplinele aferente grupei șefului de grupă autentificat.
    """
    # Verificăm dacă utilizatorul e șef de grupă
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces permis doar șefilor de grupă")

    # Găsim șeful de grupă după email
    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()
    if not sef:
        raise HTTPException(status_code=404, detail="Șeful de grupă nu a fost găsit")

    # Căutăm disciplinele care au grupa egală cu grupa lui
    discipline = db.query(Disciplina).filter(Disciplina.grupa == sef.grupa).all()

    return {
        "grupa": sef.grupa,
        "discipline": [
            {
                "id": d.id,
                "nume": d.nume,
                "titular": d.titular,
                "email": d.email
            } for d in discipline
        ]
    }

@app.get("/sefgrupa/discipline")
async def discipline_sef_grupa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")

    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()
    if not sef:
        raise HTTPException(status_code=404, detail="Sef de grupă nu găsit")

    # Obține toate disciplinele subgrupei care NU au propuneri trimise sau acceptate
    subquery = db.query(PropunereExamen.id_disciplina).filter(
        PropunereExamen.status.in_(["trimisa", "acceptata"])
    ).subquery()

    discipline = db.query(Disciplina).filter(
        Disciplina.id_subgrupa == sef.id_subgrupe,
        ~Disciplina.id.in_(subquery)
    ).all()

    return [{"id": d.id, "topic": d.topic, "cadru": d.cadru.firstName + " " + d.cadru.lastName} for d in discipline]

@app.get("/sefgrupa/propunere", response_class=HTMLResponse)
async def afiseaza_formular_propunere(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")

    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()

    # Disciplinele care NU au propunere în status „trimisa” sau „acceptata”
    subquery = db.query(PropunereExamen.id_disciplina).filter(
        PropunereExamen.status.in_(["trimisa", "acceptata"])
    ).subquery()

    discipline = db.query(Disciplina).filter(
        Disciplina.id_subgrupa == sef.id_subgrupe,
        ~Disciplina.id.in_(subquery)
    ).all()

    return templates.TemplateResponse("sefgrupa_propunere.html", {
        "request": request,
        "discipline": discipline
    })

@app.get("/sefgrupa/propunere-form", response_class=HTMLResponse)
async def propunere_form(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")

    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()

    subquery = db.query(PropunereExamen.id_disciplina).filter(
        PropunereExamen.status.in_(["trimisa", "acceptata"])
    ).subquery()

    discipline = db.query(Disciplina).filter(
        Disciplina.id_subgrupa == sef.id_subgrupe,
        ~Disciplina.id.in_(subquery)
    ).all()

    return templates.TemplateResponse("select_discipline.html", {
        "request": request,
        "discipline": discipline
    })

@app.post("/sefgrupa/propunere")
async def trimite_propunere(
    disciplina_id: int = Form(...),
    data: str = Form(...),
    durata: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")

    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()

    # Verificare conflicte
    conflict = db.query(PropunereExamen).filter(
        PropunereExamen.data == data,
        PropunereExamen.id_subgrupa == sef.id_subgrupe,
        PropunereExamen.status.in_(["trimisa", "acceptata"])
    ).first()

    if conflict:
        raise HTTPException(status_code=409, detail="Există deja o propunere în acel interval")

    prop = PropunereExamen(
        id_disciplina=disciplina_id,
        id_sefgrupa=sef.id,
        id_subgrupa=sef.id_subgrupe,
        data=data,
        durata=durata,
        status="trimisa"
    )
    db.add(prop)
    db.commit()

    return RedirectResponse("/sefgrupa/propunere", status_code=303)

@app.get("/sefgrupa/ocupare-calendar")
async def ocupare_calendar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")

    sef = db.query(Sefgrupe).filter(Sefgrupe.emailAddress == current_user.email).first()

    propuneri = db.query(PropunereExamen).join(Disciplina).filter(
        Disciplina.id_subgrupa == sef.id_subgrupe,
        PropunereExamen.status.in_(["trimisa", "acceptata"])
    ).all()

    return [
        {
            "data": p.data,
            "durata": p.durata,
            "status": p.status
        }
        for p in propuneri
    ]
@app.get("/sefgrupa/calendar", response_class=HTMLResponse)
async def afiseaza_calendar(request: Request, current_user: User = Depends(get_current_user)):
    if current_user.role != "sef_grupa":
        raise HTTPException(status_code=403, detail="Acces interzis")
    
    return templates.TemplateResponse("calendar.html", {"request": request})
