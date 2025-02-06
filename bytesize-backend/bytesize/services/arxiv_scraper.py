"""Performs Daily Scraps for certain categories of Papers"""

import requests
from typing import List, Dict
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

BASE_URL = 'http://export.arxiv.org/api/query?'

CATEGORIES = ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.MA', 'cs.NE'] 

def fetch_recent_papers(CATEGORIES: List[str], days_back: int = 1) -> List[Dict]:
    """
    Fetches papers from specified categories published the previous day.
    
    Args:
        categories: List of arXiv categories 
        days_back: Look back days 
    
    Returns:
        List[Dict]: List of papers with their details
    """
    # prev day 
    start_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y%m%d')
    
    # search query 
    search_query = f'cat:{"+OR+cat:".join(CATEGORIES)}+AND+submittedDate:[{start_date}0000+TO+{start_date}2359]'
    
    # parameter query 
    params = {
        'search_query': search_query,
        'max_results': 100,
        'sortBy': 'submittedDate',
        'sortOrder': 'descending'
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        
        # Parse & Extract XML response
        root = ET.fromstring(response.content)
        
        papers = []
        for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
            paper = {
                'title': entry.find('{http://www.w3.org/2005/Atom}title').text.strip(),
                'authors': [author.find('{http://www.w3.org/2005/Atom}name').text 
                           for author in entry.findall('{http://www.w3.org/2005/Atom}author')],
                'published': entry.find('{http://www.w3.org/2005/Atom}published').text,
                'summary': entry.find('{http://www.w3.org/2005/Atom}summary').text.strip(),
                'link': entry.find('{http://www.w3.org/2005/Atom}id').text
            }
            papers.append(paper)
        
        return papers
        
    except requests.RequestException as e:
        print(f"00:00 Call Failure: {e}")
        return []
    
    except ET.ParseError as e:
        print(f"Error parsing response: {e}")
        return []