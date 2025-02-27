from typing import List 
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from app.database.paper import Paper
from datetime import datetime, timedelta

def create_paper(
        db: Session, title: str, authors: List[str], 
        published: datetime, summary: str, layman_summary: str, 
        link: str, categories: List[str], citations: int
        ) -> Paper | None:
    """
    Creates an instance of a paper in the database 
    """
    
    if not check_paper(db, link):
        return None 

    # Parse string from API output 
    published_dt = datetime.strptime(published, "%Y-%m-%dT%H:%M:%SZ")

    # find id dynamically 
    is_cited = citations > 0
    papers_count = db.query(func.count(Paper.id)).filter(
        (Paper.citations > 0) if is_cited else (Paper.citations == 0)
    ).scalar() or 0

    new_paper = Paper(
        id=papers_count+1, 
        title=title,
        authors=authors,
        published=published_dt,
        summary=summary,
        layman_summary=layman_summary,
        link=link,
        categories=categories,
        citations=citations
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

def get_papers(db: Session, days: int = 30, cite: bool = False) -> List[Paper]:
    """
    Retrieves papers published within the last <days> days
    """
    # recent papers 
    if not cite: 
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return db.query(Paper).filter(Paper.published >= cutoff_date).order_by(Paper.id).all()
    
    # else return highly cited, where the citation count is not 0 
    return db.query(Paper).filter(Paper.citations != 0).order_by(Paper.id).all()

def check_paper(db: Session, url: str) -> bool: 
    """
    Checks if a paper is already inside the database. 

    Return True if paper dont exist 

    db... => Returns query object 
    is => Check if identify (memory matches) matches 
    """
    return db.query(Paper).filter_by(link=url).first() is None  

def reorder_paper_ids(db: Session, is_cited: bool) -> None:
    """
    Reordering such that id starts from 1, and prevent gaps upon deleting 
    """
    papers = db.query(Paper).filter(
        (Paper.citations > 0) if is_cited else (Paper.citations == 0)
    ).order_by(desc(Paper.published)).all() # newest paper 

    for i, paper in enumerate(papers, 1):
        paper.id = i

def delete_paper(db: Session, days_old: int = 60) -> int:
    """
    Deletes papers that are older than <days_old> days 
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    
    papers_to_delete = db.query(Paper).filter(
        Paper.published < cutoff_date,
        Paper.citations == 0  # delete papers with 0 citations
    ).all()
    
    if not papers_to_delete:
        return 0
    
    deleted_count = len(papers_to_delete)
    for paper in papers_to_delete:
        db.delete(paper)
    
    db.flush()
    
    reorder_paper_ids(db, is_cited=False)
    
    db.commit()
    return deleted_count

if __name__ == "__main__":
    from app.database.connection import get_db

    with next(get_db()) as db:
        papers = get_papers(db, 10)
        for p in papers: 
            print(p) # paper objects 