import asyncio
from logger import setup_logging
from fastapi import FastAPI, Depends
from app.database.crud import get_papers
from contextlib import asynccontextmanager
from app.scheduler import scheduled_scraper
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import get_db, Session

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

@app.get("/papers/{cite}")
async def get_papers_endpoint(cite: bool = False, db: Session=Depends(get_db)):
    """
    Recent papers have 0 citation

    If not cited: then return recent papers   
    """
    res = []
    papers = get_papers(db, cite=cite)

    for paper in papers: 
        res.append({
            "title": paper.title,
            "authors": paper.authors,
            "published": paper.published_dt,
            "summary": paper.summary,
            "layman_summary": paper.layman_summary,
            "link": paper.link,
            "categories": paper.categories,
            "citations": paper.citations
        })
    return res