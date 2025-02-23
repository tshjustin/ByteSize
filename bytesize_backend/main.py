from app.database.crud import create_paper
from app.database.connection import get_db
from app.api.arxiv import fetch_recent_papers
from app.api.semantic_scholar import fetch_popular_papers


# api points 




# main async loop 

def main():

    data = fetch_recent_papers(days_back=3)  ## add a dedup for this just in case days = 2/3/4 dont work 
    # data = fetch_popular_papers()
  
    if data:

        with next(get_db()) as db: # tmp before FastAPI

            for paper_data in data:
                print(paper_data)
                try:
                    title = paper_data.get('title')
                    authors = paper_data.get('authors')
                    published = paper_data.get('published')
                    summary = paper_data.get('summary', '')
                    layman_summary = paper_data.get('layman_summary', '')  
                    link = paper_data.get('link')
                    categories = paper_data.get('categories')
                    citations = paper_data.get('citations', 0)  
                    
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
                    print(f"Paper '{title}' stored successfully.")
                except Exception as e:
                    print(f"Failed to store paper '{paper_data.get('title', 'Unknown')}': {str(e)}")
    else:
        print("No papers found")

if __name__ == "__main__":
    main()