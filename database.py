from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # Acum funcționează

DATABASE_URL = "postgresql://postgres:ad12min34@localhost:5432/exam_scheduler"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db():
    Base.metadata.create_all(bind=engine)
