import requests
from typing import List, Dict
from datetime import datetime, timedelta

class ArXivScraper:
    def __init__(self, categories=['cs.AI', 'cs.LG']):
        self.base_url = 'http://export.arxiv.org/api/query?'
        self.categories = categories
    
    def fetch_recent_papers(self, days_back=7) -> List[Dict]:
        """
        Fetch recent ML/AI papers
        
        :param days_back: Number of days to look back
        :return: List of paper dictionaries
        """
        start_date = datetime.now() - timedelta(days=days_back)
        
        query = f'cat:{"+OR+".join(self.categories)}'
        params = {
            'search_query': query,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'max_results': 100
        }
        
        response = requests.get(self.base_url, params=params)
        # Parse and transform papers for database storage
        return self._parse_papers(response.content)
    
    def _parse_papers(self, xml_content):
        # XML parsing logic to extract paper details
        # Transform into database-ready format
        pass