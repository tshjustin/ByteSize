from bytesize.database.crud import create_paper
from bytesize.database.connection import get_db
from bytesize.services.arxiv_scraper import fetch_recent_papers

def main():

    data = fetch_recent_papers(days_back=1)  
  
    if data:

        with next(get_db()) as db: # tmp before FastAPI

            for paper_data in data:
                try:
                    title = paper_data.get('title')
                    authors = paper_data.get('authors')
                    published = paper_data.get('published')
                    summary = paper_data.get('summary')
                    layman_summary = paper_data.get('layman_summary', '')  
                    link = paper_data.get('link')
                    categories = paper_data.get('categories')
                    
                    # Create the paper entry in the database
                    create_paper(
                        db=db,
                        title=title,
                        authors=authors,
                        published=published,
                        summary=summary,
                        layman_summary=layman_summary,
                        link=link,
                        categories=categories
                    )
                    print(f"Paper '{title}' stored successfully.")
                except Exception as e:
                    print(f"Failed to store paper '{paper_data.get('title', 'Unknown')}': {str(e)}")
    else:
        print("No papers found")

if __name__ == "__main__":
    main()