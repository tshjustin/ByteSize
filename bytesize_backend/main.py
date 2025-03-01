import os 
import asyncio
import uvicorn
from typing import List, Dict
from logger import setup_logging
from app.database.paper import Paper
from fastapi import FastAPI, Depends
from app.database.crud import get_papers
from contextlib import asynccontextmanager
from app.scheduler import scheduled_scraper
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import get_db, Session # check db connection upon startup 
from app.api.search_arxiv import search_papers, fuzzy_match_papers

logger = setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup, run the scheduler 
    """
    logger.info("starting daily scraping")
    task = asyncio.create_task(scheduled_scraper())
    
    yield  # serves requests 
    
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        logger.info("scraping cancelled successfully")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

@api_router.get("/papers/{cite}")
async def get_papers_endpoint(cite: bool = False, db: Session=Depends(get_db)) -> List[Dict]: # TODO: Add pagination returns 
    """
    Recent papers have 0 citation

    If not cited: then return recent papers   
    """
    res = []
    papers = get_papers(db, cite=cite)

    for paper in papers: 
        res.append({
            "id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "published": paper.published,
            "summary": paper.summary,
            "layman_summary": paper.layman_summary,
            "link": paper.link,
            "categories": paper.categories,
            "citations": paper.citations
        })
    return res

@api_router.get("/search/{option}/{query}")
async def search_papers_endpoint(option: str, query: str, max_results: int = 10, db: Session=Depends(get_db)) -> List[Dict]:
    """
    Performs manual search based on option (title / author)

    Query is matched based on exact, followed by fuzzy 
    """

    results = []
    seen_url = set() 
    is_partial_query = len(query.split()) < 2 or len(query) < 10 # heuristic for short search 
    
    # local db search first 
    local_papers = []
    
    try:
        if option == "title":
            if is_partial_query:
                local_papers = db.query(Paper).filter(
                    Paper.title.ilike(f"%{query}%") # ilike => case insensitive
                ).limit(max_results).all()
            else:
                local_papers = db.query(Paper).filter(
                    Paper.title.ilike(f"%{query}%")
                ).limit(max_results).all()
        else:  
            if is_partial_query:
                local_papers = db.query(Paper).filter(
                    Paper.authors.any(lambda x: x.ilike(f"%{query}%"))
                ).limit(max_results).all()
            else:
                local_papers = db.query(Paper).filter(
                    Paper.authors.any(lambda x: x.ilike(f"%{query}%"))
                ).limit(max_results).all()
    except Exception as e:
        logger.error(" local database search fail")
    
    # add local results 
    for paper in local_papers:
        seen_url.add(paper.link) # add to seen set 
        results.append({
            "id": paper.id,
            "title": paper.title,
            "authors": paper.authors,
            "published": paper.published,
            "summary": paper.summary,
            "layman_summary": paper.layman_summary,
            "link": paper.link,
            "categories": paper.categories,
            "citations": paper.citations
        })

    # if enuf results 
    if len(results) >= max_results:
        return results[:max_results]
    
    # arxiv search 
    try:
        remaining_results = max_results - len(results)
        
        arxiv_results = []
        if is_partial_query:
            arxiv_results = fuzzy_match_papers(query, remaining_results)
        else:
            arxiv_results = search_papers(query, search_type=option, max_results=remaining_results)
        
        # Add arXiv results
        if arxiv_results:
            for paper in arxiv_results:
                if not paper["link"] in seen_url: # if title already from local db, skip
                    continue

                paper["layman_summary"] = None
                paper["id"] = None
                results.append(paper)

                if len(results) >= max_results:
                    break

    except Exception as e:
        logger.error("arXiv search fail")
    
    return results[:max_results]

@api_router.get("/ping")
async def ping():
    return "Ping Successful!"

app.include_router(api_router)

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "out")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print("Frontend build directory not")

def start_server():
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False, # False if prod 
        log_level="info"
    )

if __name__ == "__main__":
    start_server() 