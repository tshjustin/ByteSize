import asyncio
from logger import setup_logging
from app.summarizer import simple_summary, extract_pdf_content
from app.database.connection import get_db
from app.database.crud import create_paper
from app.api.arxiv import fetch_recent_papers
from datetime import datetime, time, timedelta

logger = setup_logging()

MAX_TRIES = 5 

async def scheduled_scraper():
    """
    Performs API scrapes daily at 00:00
    """
    while True:
        now = datetime.now() # if now is 2024-02-20 15:30:00
        target = datetime.combine(now.date() + timedelta(days=1), time()) # target = 2025-02-21: 00:00:00 | (new_date, time()=>00:00)
        seconds_to_target = (target - now).total_seconds()

        logger.info(f"Scrape Timing Check: {seconds_to_target}")
        await asyncio.sleep(seconds_to_target)
        
        # scrape after wait 
        logger.info("scheduled paper scraping")
        try:
            for look_back in range(MAX_TRIES):
                data = fetch_recent_papers(days_back=look_back)
                
                if data:
                    with next(get_db()) as db:
                        for paper_data in data:
                            try:
                                title = paper_data.get('title')
                                authors = paper_data.get('authors')
                                published = paper_data.get('published')
                                summary = paper_data.get('summary', '')
                                link = paper_data.get('link')
                                categories = paper_data.get('categories')
                                citations = paper_data.get('citations', 0)

                                # summarizer 
                                content = extract_pdf_content(link)
                                layman_summary = simple_summary(content)

                                if not layman_summary:
                                    continue  

                                create_paper(
                                    db=db,
                                    title=title,
                                    authors=authors,
                                    published=published,
                                    summary=summary,
                                    layman_summary=layman_summary,
                                    link=link,
                                    categories=categories,
                                    citations=citations
                                )
                                logger.info(f" stored successfully")
                            except Exception as e:
                                logger.error("Failed to store", str(e))
                        break 
                else:
                    logger.warning(f" 0 papers fetched - {look_back+1}/5 Tries")
        except Exception as e:
            logger.error(str(e))

if __name__ == "__main__":

    # manually fetch papers 
    data = fetch_recent_papers(days_back=3)
            
    with next(get_db()) as db:
        for paper_data in data:

            title = paper_data.get('title')
            authors = paper_data.get('authors')
            published = paper_data.get('published')
            summary = paper_data.get('summary', '')
            link = paper_data.get('link')
            categories = paper_data.get('categories')
            citations = paper_data.get('citations', 0)

            # summarizer 
            content = extract_pdf_content(link)
            layman_summary = simple_summary(content)

            create_paper(
                db=db,
                title=title,
                authors=authors,
                published=published,
                summary=summary,
                layman_summary=layman_summary,
                link=link,
                categories=categories,
                citations=citations
            )