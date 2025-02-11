"""Data model class for POSTGRES"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ARRAY, DateTime

Base = declarative_base()

class Paper(Base):
    __tablename__ = "Papers"
    
    title = Column(String, primary_key=True)
    authors = Column(ARRAY(String))
    published = Column(DateTime)
    summary = Column(String)
    layman_summary = Column(String, nullable=True)
    link = Column(String)
    categories = Column(ARRAY(String))