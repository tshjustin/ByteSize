import re
import requests
from typing import List, Dict
from logger import setup_logging
import xml.etree.ElementTree as ET
from app.config import ARXIV_BASE_URL
from app.api.arxiv import arxiv_format

logger = setup_logging()

def search_papers(query: str, search_type: str, max_results: int = 5) -> List[Dict]:
    """
    Search for papers on arXiv based on query string.
    
    Args:
        query: Search query 
        search_type: type of search ('author', 'title')
        max_results: number of results to return
        
    Returns:
        List of paper dictionaries with metadata
    """

    query = query.strip()

    # build appropriate search for arxiv 
    if search_type == 'author':
        search_query = f'au:"{query}"'
    else:
        search_query = f'ti:"{query}"'

    params = {
        'search_query': search_query,
        'max_results': max_results,
        'sortBy': 'relevance',
        'sortOrder': 'descending'
    }
    
    response = requests.get(ARXIV_BASE_URL, params=params)
    return arxiv_format(response)

def fuzzy_match_papers(query: str, max_results: int = 10) -> List[Dict] | None:
    """
    Perform a fuzzy search for papers to handle partial matches.
    
    breaks down the query into key terms and searches for papers that contain those terms in title
    """

    terms = [term.lower() for term in query.split() if len(term) >= 4]
    
    # if query string is too short 
    if not terms:
        return None 
    
    # Build a search query that matches any of the key terms in the title
    search_query = ' OR '.join([f'ti:{term}' for term in terms])
    
    params = {
        'search_query': search_query,
        'max_results': max_results * 3,  # increase search space 
        'sortBy': 'relevance',
        'sortOrder': 'descending'
    }
    
    response = requests.get(ARXIV_BASE_URL, params=params)
    response.raise_for_status()
    
    root = ET.fromstring(response.content)
    entries = root.findall('.//{http://www.w3.org/2005/Atom}entry')
    
    # rank results
    results = []
    for entry in entries:
        title = entry.find('.//{http://www.w3.org/2005/Atom}title').text.strip()
        title_lower = title.lower()
        
        # for each title, +1 score for each term that appears in title 
        score = sum(1 for term in terms if term in title_lower)
        
        # for matching, users typically type in terms in order "attention is all" ==> attention is all you need => Should rank such papers higher 
        # more score if the terms are in order 
        if ' '.join(terms) in title_lower:
            score += 3
            
        # create dict for further reranking later 
        paper = {
            'title': title,
            'authors': [author.find('.//{http://www.w3.org/2005/Atom}name').text 
                    for author in entry.findall('.//{http://www.w3.org/2005/Atom}author')],
            'published': entry.find('.//{http://www.w3.org/2005/Atom}published').text,
            'summary': re.sub(r'\n', ' ', entry.find('.//{http://www.w3.org/2005/Atom}summary').text.strip()),
            'link': entry.find('.//{http://www.w3.org/2005/Atom}id').text,
            'categories': [cat.get('term') for cat in entry.findall('.//{http://www.w3.org/2005/Atom}category')],
            'relevance_score': score
        }
        
        results.append(paper)
    
    # sort by relevance score + take max 
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    filtered_results = results[:max_results]
    
    # rm relevance score 
    for paper in filtered_results:
        paper.pop('relevance_score', None)
        
    logger.info(f" {len(filtered_results)} papers from fuzzy matching")
    return filtered_results
    
if __name__ == "__main__":
    
    # regular search 
    results = search_papers("Attention Is All You Need", 'title', 3)

    #  partial search
    results = fuzzy_match_papers("attention is", 3)

    # author search
    results = search_papers("Geoffrey Hinton", 'author', 3)