"""Database initialization for development - KIV Extention for production"""

import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from bytesize.database.paper import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_dev_db():
    """Initialize database only if tables don't exist."""
    load_dotenv()
    
    database_url = os.getenv("SUPABASE_DATABASE_URL")
    
    engine = create_engine(
        database_url,
        echo=True, 
        pool_size=5,
        pool_pre_ping=True
    )
    
    # check tables 
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    # check specifics 
    required_tables = {"papers"}  
    existing_tables = set(tables)
    
    if not required_tables.issubset(existing_tables):
        logger.info("Some tables are missing. Creating database schema...")
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database schema created successfully!")
        except Exception as e:
            logger.error(f"Failed to create database schema: {e}")
            raise
    else:
        logger.info("Database schema already exists. Skipping initialization.")
    
    return engine

if __name__ == "__main__":
    init_dev_db()