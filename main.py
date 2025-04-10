from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import User  # Model SQLAlchemy
from database import SessionLocal, engine, Base  # Importă Base din database.py
import passlib.hash as _hash
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer

# Configurare JWT
SECRET_KEY = "secret-key-puternică"  # În producție folosește variabilă de mediu
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Modele Pydantic
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "user"

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True  # Permite conversia din ORM

class Token(BaseModel):
    access_token: str
    token_type: str

# Inițializare aplicație
app = FastAPI()

# Crează tabelele în baza de date
Base.metadata.create_all(bind=engine)

# Dependency pentru sesiunea de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Funcție pentru crearea token-ului JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Endpoint pentru creare utilizator
@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verifică dacă emailul există
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Verifică rolul (doar valori permise)
    if user.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'user' or 'admin'"
        )
    
    # Hash-uieste parola
    hashed_password = _hash.bcrypt.hash(user.password)
    
    # Creează utilizatorul
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role  # Folosește rolul din request
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Endpoint pentru login și generare token
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Verifică utilizatorul
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not _hash.bcrypt.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Crează token JWT
    access_token = create_access_token(
        data={"sub": user.email}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint protejat exemplu
@app.get("/users/me/", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)  # Va trebui implementat
):
    return current_user
