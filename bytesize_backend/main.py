import os
import asyncio
import uvicorn
from typing import List, Dict, Any 
from logger import setup_logging
from app.database.paper import Paper
from fastapi import FastAPI, Depends, HTTPException, Query 
from app.database.crud import get_papers, create_paper 
from contextlib import asynccontextmanager
from app.scheduler import scheduled_scraper 
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import get_db, Session
from app.api.search_arxiv import search_papers, fuzzy_match_papers
from fastapi.responses import FileResponse, HTMLResponse 

logger = setup_logging()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
frontend_path = os.path.join(BASE_DIR, "..", "bytesize_frontend", "out") 
INDEX_HTML_PATH = os.path.join(frontend_path, "index.html")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup, run the scheduler
    """
    logger.info("Starting daily scraping task in background...")

    if not os.path.exists(frontend_path):
         logger.error(f"Frontend build directory not found at: {frontend_path}")
         logger.error("Ensure the frontend is built ('npm run build') before starting the backend.")

    elif not os.path.exists(INDEX_HTML_PATH):
         logger.error(f"index.html not found in frontend build directory: {INDEX_HTML_PATH}")
         logger.error("Ensure the frontend build process completed successfully.")

    task = asyncio.create_task(scheduled_scraper())
    yield
    logger.info("Cancelling scraping task.")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        logger.info("Scraping task cancelled successfully.")
    except Exception as e:
        logger.error(f"Error during scraping task shutdown: {e}")


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

@api_router.get("/papers/{cite_param}") 
async def get_papers_endpoint(
    cite_param: str,
    page: int = Query(1, ge=1), 
    page_size: int = Query(9, ge=1, le=100), 
    db: Session = Depends(get_db)
) -> Dict[str, Any]: 
    """
    Get papers based on citation status (cited or recent) with pagination.
    cite_param: 'cited' for papers with citations > 0, 'recent' for papers with citations == 0.
    """
    if cite_param == "cited":
        is_cited = True
    elif cite_param == "recent":
        is_cited = False
    else:
        raise HTTPException(status_code=400, detail="Invalid citation parameter. Use 'cited' or 'recent'.")

    try:
        result = get_papers(db, cite=is_cited, page=page, page_size=page_size)
        formatted_papers = []
        for paper in result['papers']:
            formatted_papers.append({
                "id": paper.id,
                "title": paper.title,
                "authors": paper.authors,
                "published": paper.published.isoformat() if paper.published else None,
                "summary": paper.summary,
                "layman_summary": paper.layman_summary,
                "link": paper.link,
                "categories": paper.categories,
                "citations": paper.citations
            })
        return {"papers": formatted_papers, "total_papers": result['total_papers']}
    except Exception as e:
        logger.error(f"Error fetching papers (cited={is_cited}, page={page}): {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching papers.")


@api_router.get("/search/{option}/{query}")
async def search_papers_endpoint(
    option: str,
    query: str,
    max_results: int = Query(10, ge=1, le=50), 
    db: Session=Depends(get_db)
    ) -> List[Dict]: 
    """
    Performs manual search based on option (title / author).
    Query is matched based on exact, followed by fuzzy.
    """
    results = []
    seen_urls = set() # Use different variable name
    is_partial_query = len(query.split()) < 2 or len(query) < 10 # heuristic for short search

    # local db search first
    local_papers = []
    try:
        q_filter = None
        search_term = f"%{query}%"

        if option == "title":
             q_filter = Paper.title.ilike(search_term)
        elif option == "author":
             q_filter = Paper.authors.any(lambda author: author.ilike(search_term)) 
        else:
             raise HTTPException(status_code=400, detail="Invalid search option. Use 'title' or 'author'.")

        if q_filter is not None:
            local_papers = db.query(Paper).filter(q_filter).limit(max_results).all()

    except Exception as e:
        logger.error(f"Local database search failed: {e}")

    for paper in local_papers:
        if paper.link not in seen_urls:
            seen_urls.add(paper.link)
            results.append({
                "id": paper.id,
                "title": paper.title,
                "authors": paper.authors,
                "published": paper.published.isoformat() if paper.published else None,
                "summary": paper.summary,
                "layman_summary": paper.layman_summary,
                "link": paper.link,
                "categories": paper.categories,
                "citations": paper.citations
            })

    if len(results) >= max_results:
        return results[:max_results]

    try:
        remaining_results = max_results - len(results)
        if remaining_results > 0:
            arxiv_results = []
            logger.info(f"Searching arXiv for '{query}' (option: {option}, partial: {is_partial_query})")
            if is_partial_query:
                arxiv_results = fuzzy_match_papers(query, remaining_results)
            else:
                arxiv_results = search_papers(query, search_type=option, max_results=remaining_results)

            if arxiv_results:
                for paper in arxiv_results:
                    if paper.get("link") and paper["link"] not in seen_urls:
                        results.append({
                            "id": None, 
                            "title": paper.get("title"),
                            "authors": paper.get("authors"),
                            "published": paper.get("published"), 
                            "summary": paper.get("summary"),
                            "layman_summary": None, 
                            "link": paper.get("link"),
                            "categories": paper.get("categories"),
                            "citations": None 
                        })
                        seen_urls.add(paper["link"])
                        if len(results) >= max_results:
                            break
    except Exception as e:
        logger.error(f"arXiv search failed: {e}")

    return results[:max_results]


@api_router.get("/ping")
async def ping():
    return {"message": "Ping Successful!"} 

app.include_router(api_router)

if os.path.exists(frontend_path):
    logger.info(f"Mounting static files from: {frontend_path}")
    app.mount("/_next", StaticFiles(directory=os.path.join(frontend_path, "_next"), html=False), name="next-static")
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets"), html=False), name="assets-static")
    app.mount("/public", StaticFiles(directory=os.path.join(BASE_DIR, "..", "bytesize_frontend", "public"), html=False), name="public-static")

else:
    logger.warning(f"Static file directory not found at {frontend_path}, static serving disabled.")

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_spa(full_path: str):
    """
    Serve the index.html for all non-API, non-static file paths to enable SPA routing.
    """
    logger.debug(f"Catch-all route triggered for path: {full_path}")
    if os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH)
    else:
        logger.error(f"index.html not found at {INDEX_HTML_PATH} for catch-all route.")
        raise HTTPException(status_code=404, detail="Frontend entry point not found.")


def start_server():
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0") 
    reload_status = os.environ.get("FASTAPI_RELOAD", "false").lower() == "true" 

    logger.info(f"Starting server on {host}:{port} (Reload: {reload_status})")

    if not os.getenv("SUPABASE_DATABASE_URL"):
        logger.critical("FATAL: SUPABASE_DATABASE_URL environment variable not set.")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload_status, 
        log_level="info" 
    )

if __name__ == "__main__":
    start_server()