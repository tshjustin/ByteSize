import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

ARXIV_BASE_URL = 'http://export.arxiv.org/api/query?'
CATEGORIES = ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.MA', 'cs.NE']

SEMANTIC_SCHOLAR_URL = 'http://api.semanticscholar.org/graph/v1/paper/search/bulk'