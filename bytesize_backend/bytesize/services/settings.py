BASE_URL = 'http://export.arxiv.org/api/query?'

SEMANTIC_SCHOLAR_URL = 'http://api.semanticscholar.org/graph/v1/paper/search/bulk'

CATEGORY_DESCRIPTIONS = {
   'cs.AI': 'Artificial Intelligence',
   'cs.CL': 'Computation and Language - NLP',
   'cs.CV': 'Computer Vision',
   'cs.LG': 'Machine Learning - Supervised/Unsupervised Learning, Reinforcement Learning, Bandit Problems',
   'cs.MA': 'Multiagent Systems - Distributed AI, Intelligent Agents, Coordinated Interactions',
   'cs.NE': 'Neural and Evolutionary Computing - Neural Networks, Genetic Algorithms, Artificial Life, Adaptive Behavior'
}

CATEGORIES = list(CATEGORY_DESCRIPTIONS.keys())