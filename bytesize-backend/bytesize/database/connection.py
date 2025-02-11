"""Database connection configuration with connection pooler setup."""

import os
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

load_dotenv(override=True)

DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_size=5,              # Reduced pool size for better resource management
    max_overflow=10,          # Maximum number of connections that can be created beyond pool_size
    pool_timeout=30,          # Seconds to wait before giving up on getting a connection
    pool_recycle=3600,        # Recycle connections after 1 hour to prevent stale connections
    pool_pre_ping=True        # Verify connection is still valid before using it
)

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