import os
from dotenv import load_dotenv
from sqlalchemy.sql import text
from logger import setup_logging
from sqlalchemy import create_engine, MetaData

load_dotenv()

logger = setup_logging()

def migrate_database():

    load_dotenv()
    database_url = os.getenv("SUPABASE_DATABASE_URL")
    
    if not database_url:
        return
    
    engine = create_engine(database_url)
    metadata = MetaData()
    
    with engine.connect() as conn:
        transaction = conn.begin()
        try:

            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='papers' AND column_name='id'
            """))
            
            if result.fetchone() is None:
                conn.execute(text("""
                    ALTER TABLE "Papers" 
                    ADD COLUMN id INTEGER
                """))

                logger.info("Assigning IDs to cited papers")
                conn.execute(text("""
                    WITH cited_papers AS (
                        SELECT title, ROW_NUMBER() OVER (ORDER BY published DESC) as row_num
                        FROM "Papers"
                        WHERE citations > 0
                    )
                    UPDATE "Papers" p
                    SET id = cp.row_num
                    FROM cited_papers cp
                    WHERE p.title = cp.title
                """))
                
                logger.info("Assigning IDs to non-cited papers")
                conn.execute(text("""
                    WITH non_cited_papers AS (
                        SELECT title, ROW_NUMBER() OVER (ORDER BY published DESC) as row_num
                        FROM "Papers"
                        WHERE citations = 0 OR citations IS NULL
                    )
                    UPDATE "Papers" p
                    SET id = ncp.row_num
                    FROM non_cited_papers ncp
                    WHERE p.title = ncp.title
                """))
                
                conn.execute(text("""
                    ALTER TABLE "Papers" 
                    ALTER COLUMN id SET NOT NULL
                """))

                conn.execute(text("""
                    CREATE INDEX papers_id_idx ON "Papers" (id)
                """))

                conn.execute(text("""
                    CREATE INDEX papers_id_citations_idx ON "Papers" (id, citations)
                """))
                
                logger.info("Migration completed successfully")
            else:
                logger.info("ID column already exists, no migration needed")
            
            transaction.commit()
            logger.info(" migration committed ")
            
        except Exception as e:
            transaction.rollback()
            logger.error(f"Migration failed: {str(e)}")
            raise

if __name__ == "__main__":
    migrate_database()