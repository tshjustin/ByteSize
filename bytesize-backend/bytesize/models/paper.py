"""Data model class for POSTGRES"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ARRAY, DateTime

Base = declarative_base()

class Paper(Base):
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    authors = Column(ARRAY(String))
    published = Column(DateTime)
    summary = Column(String)
    layman_summary = Column(String)
    link = Column(String)
    categories = Column(ARRAY(String))