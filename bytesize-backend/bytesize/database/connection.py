import os 
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Starts the Posgtgres Session upon calling, and closes when 
    request has passed through. 

    Prevents connection leaks
    """
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

"""
When yield() used during a function call, it would pass at `yield`
and would only resume upon next(), where it remembers where the function 
was left off 
"""