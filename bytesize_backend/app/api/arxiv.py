import re 
import requests
from typing import List, Dict, Optional
from logger import setup_logging
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from app.config import ARXIV_BASE_URL, CATEGORIES

logger = setup_logging()

def fetch_recent_papers(days_back: int = 1) -> List[Dict]:
    """
    Scraps selected categories of papers for the new day.
    """
    now = datetime.now()

    start_date = (now- timedelta(days=days_back)).strftime('%Y%m%d')

    logger.info(f" Current Searchtime: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f" Searching for papers from date: {start_date}")
    
    search_query = f"({' OR '.join(f'cat:{cat}' for cat in CATEGORIES)}) AND submittedDate:[{start_date}0000 TO {start_date}2359]"
    
    params = {
        'search_query': search_query,
        'max_results': 100,
        'sortBy': 'submittedDate',
        'sortOrder': 'descending'
    }

    try:
        response = requests.get(ARXIV_BASE_URL, params=params)
        return arxiv_format(response)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return []

def arxiv_format(response: requests.Response) -> List[Dict]: 
    root = ET.fromstring(response.content)
    entries = root.findall('.//{http://www.w3.org/2005/Atom}entry')
    
    papers = []
    for entry in entries:
        categories = [cat.get('term') for cat in entry.findall('.//{http://www.w3.org/2005/Atom}category')]
        
        # Only include paper if all its categories are in CATEGORIES
        if all(cat in CATEGORIES for cat in categories):
            paper = {
                'title': entry.find('.//{http://www.w3.org/2005/Atom}title').text.strip(),
                'authors': [author.find('.//{http://www.w3.org/2005/Atom}name').text 
                        for author in entry.findall('.//{http://www.w3.org/2005/Atom}author')],
                'published': entry.find('.//{http://www.w3.org/2005/Atom}published').text,
                'summary': re.sub(r'\n', ' ', entry.find('.//{http://www.w3.org/2005/Atom}summary').text.strip()),
                'link': entry.find('.//{http://www.w3.org/2005/Atom}id').text,
                'categories': categories
            }
            papers.append(paper)

    logger.info(f" {len(papers)} papers from direct match")

    return papers

if __name__ == "__main__": 
    data = fetch_recent_papers()
    print(data[0]) # python -m bytesize.services.arxiv_scraper