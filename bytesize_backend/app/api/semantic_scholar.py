import re
import requests
from typing import List, Dict
from datetime import datetime
from app.database.paper import Paper
from app.config import ARXIV_BASE_URL
from app.database.connection import get_db
from app.config import SEMANTIC_SCHOLAR_URL

def append_default_time(date_str: str) -> str:
    if date_str is None:
        return "2015-01-01T00:00:00Z" 
    return f"{date_str}T00:00:00Z"

def fetch_popular_papers(min_citations: int = 10000) -> List[Dict]:
    params = {
        "query": "*",
        "fields": "title,authors,publicationDate,citationCount,abstract,url,fieldsOfStudy",
        "limit": 1000,
        "minCitationCount": min_citations,
        "fieldsOfStudy": "Computer Science",
        "sort": "citationCount:desc",
        "year": "2015-"
    }

    response = requests.get(SEMANTIC_SCHOLAR_URL, params=params)
    response.raise_for_status()
    
    data = response.json()
    papers = []
    
    for paper in data.get('data', []):
        fields = paper.get('fieldsOfStudy', [])
        if fields == ['Computer Science']:
            processed_paper = {
                'title': paper.get('title'),
                'authors': [author.get('name') for author in paper.get('authors', [])],
                'published': append_default_time(paper.get('publicationDate')),
                'summary': paper.get('abstract'),
                'link': paper.get('url'),
                'categories': fields,
                'citations': paper.get('citationCount')
            }
            papers.append(processed_paper)

    return papers[:1000]


def clean_title(title: str) -> str:
    """
    Clean title for search by removing special characters and extra whitespace.
    """
    cleaned = re.sub(r'[^\w\s-]', '', title)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

def search_arxiv_by_title(title: str) -> dict:
    """
    Search for a paper on arXiv using its title.
    """
    try:
        search_query = f'ti:"{title}"'
        params = {
            'search_query': search_query,
            'max_results': 1,
            'sortBy': 'relevance',
            'sortOrder': 'descending'
        }
        
        response = requests.get(ARXIV_BASE_URL, params=params)
        response.raise_for_status()
        
        import xml.etree.ElementTree as ET
        root = ET.fromstring(response.content)
        
        entry = root.find('.//{http://www.w3.org/2005/Atom}entry')
        if entry is None:
            return None
            
        arxiv_title = entry.find('.//{http://www.w3.org/2005/Atom}title').text.strip()
        
        # check title similarity 
        if not titles_match(title, arxiv_title):
            return None
            
        data = {
            'title': arxiv_title,
            'authors': [author.find('.//{http://www.w3.org/2005/Atom}name').text 
                       for author in entry.findall('.//{http://www.w3.org/2005/Atom}author')],
            'published': entry.find('.//{http://www.w3.org/2005/Atom}published').text,
            'summary': re.sub(r'\n', ' ', entry.find('.//{http://www.w3.org/2005/Atom}summary').text.strip()),
            'link': entry.find('.//{http://www.w3.org/2005/Atom}id').text,
            'categories': [cat.get('term') for cat in entry.findall('.//{http://www.w3.org/2005/Atom}category')]
        }
        
        return data
        
    except Exception as e:
        return None

def titles_match(title1: str, title2: str, threshold: float = 0.9) -> bool:
    """
    Check if two titles match closely enough, ignoring case and punctuation.
    Uses character-level Levenshtein distance for comparison.
    """
    from difflib import SequenceMatcher
    
    clean1 = clean_title(title1.lower())
    clean2 = clean_title(title2.lower())
    
    similarity = SequenceMatcher(None, clean1, clean2).ratio()
    return similarity >= threshold

def update_semantic_scholar_papers():
    """
    Update Semantic Scholar papers with data from arXiv while preserving citation counts.
    """
    with next(get_db()) as db:

        semantic_papers = db.query(Paper).filter(Paper.citations != 0).all()
        
        for paper in semantic_papers:
            
            arxiv_data = search_arxiv_by_title(paper.title)
            
            original_citations = paper.citations
            
            paper.title = arxiv_data['title']
            paper.authors = arxiv_data['authors']
            paper.published = datetime.strptime(arxiv_data['published'], "%Y-%m-%dT%H:%M:%SZ")
            paper.summary = arxiv_data['summary']
            paper.link = arxiv_data['link']
            paper.categories = arxiv_data['categories']
            
            paper.citations = original_citations
                
            db.commit()


if __name__ == "__main__":
    data = fetch_popular_papers()
    update_semantic_scholar_papers()