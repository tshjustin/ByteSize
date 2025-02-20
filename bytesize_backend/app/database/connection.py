"""Database connection configuration with connection pooler setup."""

from typing import Generator
from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session
from app.database.init_db import init_dev_db

load_dotenv(override=True)

engine = init_dev_db()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """
    Creates a database session and handles cleanup
    
    Yields:
        Session: SQLAlchemy database session
    
    Example:
        # Using with context manager (recommended)
        with next(get_db()) as db:
            result = db.query(Model).all()
            
        # Using directly
        db = next(get_db())
        try:
            result = db.query(Model).all()
        finally:
            db.close()
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        raise
    finally:
        db.close()

"""
When yield() used during a function call, it would pass at `yield`
and would only resume upon next(), where it remembers where the function 
was left off 
"""