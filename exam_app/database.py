"""
Database connection and session initialization module using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import os

# Retrieve database URL from environment variables with a default fallback for local dev
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:ad12min34@localhost:5432/exam_scheduler"
)

# Initialize SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Factory for creating local database sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db():
    """
    Creates all database tables defined in the Base metadata if they do not exist.
    """
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    Dependency generator for obtaining a database session per HTTP request.
    Ensures the session is properly closed after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()