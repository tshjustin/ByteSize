from typing import List 
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

    # Parse string from API output 
    published_dt = datetime.strptime(published, "%Y-%m-%dT%H:%M:%SZ")

    new_paper = Paper(
        title=title,
        authors=authors,
        published=published_dt,
        summary=summary,
        layman_summary=layman_summary,
        link=link,
        categories=categories,
        citations=citations
    )

    if check_paper(db, link):
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        return new_paper
    return None 

def get_papers(db: Session, days: int = 1, cite: bool = False) -> List[Paper]:
    """
    Retrieves papers published within the last <days> days
    """
    # recent papers 
    if not cite: 
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return db.query(Paper).filter(Paper.published >= cutoff_date).all()
    
    # else return highly cited, where the citation count is not 0 
    return db.query(Paper).filter(Paper.citations != 0).all()

def check_paper(db: Session, url: str) -> bool: 
    """
    Checks if a paper is already inside the database. 

    Return True if paper dont exist 

    db... => Returns query object 
    is => Check if identify (memory matches) matches 
    """
    return db.query(Paper).filter_by(link=url).first() is None  

def delete_paper(db: Session, days_old: int = 60) -> int:
    """
    Deletes papers that are older than <days_old> days 
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    papers_to_delete = db.query(Paper).filter(Paper.published < cutoff_date).all()
    
    deleted_count = len(papers_to_delete)
    for paper in papers_to_delete:
        db.delete(paper)
    
    db.commit()
    return deleted_count

if __name__ == "__main__":
    from app.database.connection import get_db

    with next(get_db()) as db:
        papers = get_papers_last_x_days(db, 10)
        for p in papers: 
            print(p) # paper objects 