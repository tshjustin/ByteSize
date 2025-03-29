from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.paper import Paper
from sqlalchemy import func, desc, asc
from datetime import datetime, timedelta

def create_paper(
        db: Session, title: str, authors: List[str],
        published: str, # Keep as string for initial parsing
        summary: str, layman_summary: str,
        link: str, categories: List[str], citations: int
        ) -> Paper | None:
    """
    Creates an instance of a paper in the database
    """
    existing_paper = db.query(Paper).filter(Paper.link == link).first()
    if existing_paper:
        print(f"Paper with link {link} already exists. Skipping.")
        return None 
    
    existing_paper_by_title = db.query(Paper).filter(func.lower(Paper.title) == func.lower(title)).first()
    if existing_paper_by_title:
        print(f"Paper with title '{title}' already exists. Skipping.")
        return None 

    try:
        published_dt = datetime.strptime(published, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        print(f"Error parsing date: {published}. Using default.")
        published_dt = datetime.utcnow() 

    is_cited = citations > 0
    papers_count_query = db.query(func.count(Paper.id))
    if is_cited:
        papers_count_query = papers_count_query.filter(Paper.citations > 0)
    else:
        papers_count_query = papers_count_query.filter(Paper.citations == 0)

    papers_count = papers_count_query.scalar() or 0
    new_id = papers_count + 1

    new_paper = Paper(
        id=new_id, 
        title=title,
        authors=authors,
        published=published_dt,
        summary=summary,
        layman_summary=layman_summary,
        link=link,
        categories=categories,
        citations=citations
    )

    try:
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        print(f"Successfully added paper: {title}")
        return new_paper
    except Exception as e:
        db.rollback()
        print(f"Error adding paper {title}: {e}")
        if "duplicate key value violates unique constraint" in str(e):
             print(f"Constraint violation likely means paper '{title}' or link '{link}' already exists.")
        return None

def get_papers(db: Session, cite: bool = False, page: int = 1, page_size: int = 9) -> Dict:
    """
    Retrieves papers based on citation status with pagination.
    For recent papers (cite=False), returns them sorted by published date (descending, newest first).
    For cited papers (cite=True), returns them ordered by id (ascending).
    Also returns the total count of papers matching the criteria.
    """
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 9

    offset = (page - 1) * page_size

    query = db.query(Paper)
    count_query = db.query(func.count(Paper.id)) 

    if not cite:
        query = query.filter(Paper.citations == 0)
        query = query.order_by(desc(Paper.published))

        count_query = count_query.filter(Paper.citations == 0)
    else:
        query = query.filter(Paper.citations > 0)
        query = query.order_by(asc(Paper.id)) 

        count_query = count_query.filter(Paper.citations > 0)

    total_papers = count_query.scalar() or 0
    papers = query.offset(offset).limit(page_size).all()

    return {"papers": papers, "total_papers": total_papers}


def reorder_paper_ids(db: Session, is_cited: bool) -> None:
    """
    Reordering such that id starts from 1, and prevent gaps upon deleting.
    Orders by published date descending for consistency.
    """
    query = db.query(Paper)
    if is_cited:
        query = query.filter(Paper.citations > 0)
    else:
        query = query.filter(Paper.citations == 0)

    papers = query.order_by(desc(Paper.published)).all()

    temp_id_start = (db.query(func.max(Paper.id)).scalar() or 0) + 1000 

    for i, paper in enumerate(papers, 1):
         if paper.id != i: 
              paper.id = i


def delete_paper(db: Session, days_old: int = 60) -> int:
    """
    Deletes non-cited papers that are older than <days_old> days and reorders IDs.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)

    papers_to_delete = db.query(Paper).filter(
        Paper.published < cutoff_date,
        Paper.citations == 0  # Only delete papers with 0 citations
    ).all()

    if not papers_to_delete:
        print("No old, non-cited papers found to delete.")
        return 0

    deleted_count = len(papers_to_delete)
    print(f"Found {deleted_count} papers older than {days_old} days with 0 citations to delete.")

    for paper in papers_to_delete:
        db.delete(paper)

    db.flush() 

    print("Reordering IDs for non-cited papers...")
    reorder_paper_ids(db, is_cited=False)

    db.commit() 
    print(f"Successfully deleted {deleted_count} papers and reordered IDs.")
    return deleted_count