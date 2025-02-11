from datetime import datetime 
from typing import List, Optional
from sqlalchemy.orm import Session
from bytesize.models.paper import Paper 

def create_paper(
        db: Session, id: int, title: str, authors: List[str], 
        published: datetime, summary: str, layman_summary: str, 
        link: str, categories: List[str]
        ) -> Paper:
    """
    Creates an instance of a paper in the database 
    """
    new_paper = Paper(
        id=id,
        title=title,
        authors=authors,
        published=published,
        summary=summary,
        layman_summary=layman_summary,
        link=link,
        categories=categories
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

def get_all_papers(db: Session, lookback: int) -> List[Paper]:
    """
    Retrieves Papers that are of <x> days old 
    """
    return db.query(Paper).all()


def delete_paper(db: Session, paper_id: int) -> Optional[Paper]:
    """
    Deletes papers that are <y> days old 
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    db.delete(paper)
    db.commit()
    return paper
