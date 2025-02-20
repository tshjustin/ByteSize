import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")

ARXIV_BASE_URL = 'http://export.arxiv.org/api/query?'
CATEGORIES = ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.MA', 'cs.NE']

SEMANTIC_SCHOLAR_URL = 'http://api.semanticscholar.org/graph/v1/paper/search/bulk'


# cs.AI = Artificial Intelligence
# cs.CL = Computation and Language
# cs.CV = Computer Vision and Pattern Recognition
# cs.LG = Machine Learning
# cs.MA = Multiagent Systems
# cs.NE = Neural and Evolutionary Computing 