from typing import List
from sqlalchemy.orm import Session
from bytesize.database.paper import Paper 
from datetime import datetime, timedelta

def create_paper(
        db: Session, title: str, authors: List[str], 
        published: datetime, summary: str, layman_summary: str, 
        link: str, categories: List[str]
        ) -> Paper:
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
        categories=categories
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

def get_papers_last_x_days(db: Session, days: int = 1) -> List[Paper]:
    """
    Retrieves papers published within the last <days> days
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    return db.query(Paper).filter(Paper.published >= cutoff_date).all()


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