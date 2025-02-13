"""Test database connection script"""

import os
import psycopg2
import logging
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    
    load_dotenv(override=True) # override forcefully 
    
    logger.info("Testing connection with connection pooler...")
    try:
        # connection pooler URL
        conn_string = os.getenv("SUPABASE_DATABASE_URL")
        
        conn = psycopg2.connect(conn_string)
        logger.info("Connection successful!")
        
        # Test query
        cur = conn.cursor()
        cur.execute('SELECT version();')
        version = cur.fetchone()
        logger.info(f"PostgreSQL version: {version}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Connection failed: {str(e)}")
        raise

if __name__ == "__main__":
    test_connection()