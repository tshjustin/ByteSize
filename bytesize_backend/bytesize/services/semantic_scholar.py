import requests
from typing import List, Dict
from datetime import datetime
from bytesize.services.settings import SEMANTIC_SCHOLAR_URL

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

if __name__ == "__main__":
    data = fetch_popular_papers()
    print(data[7])