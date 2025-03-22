import os 
import re
import io 
import PyPDF2
import requests
from openai import OpenAI
from dotenv import load_dotenv
from logger import setup_logging

load_dotenv()
logger = setup_logging()

OAI_KEY = os.getenv("OPENROUTER_API_KEY")
OR_ENDPOINT = os.getenv("OPENROUTER_ENDPOINT")

headers = {
    "Authorization": f"Bearer {OAI_KEY}",
    "Content-Type": "application/json",
}

def extract_pdf_content(url: str) -> None:
    """
    Extracts PDF from arxhiv link => id/abs/title => id/pdf/title
    """
    pdf_url = re.sub(r'\/abs\/', '/pdf/', url) 

    try: 
        response = requests.get(pdf_url) # no need for if stat=200, since it any error => exception blk
        pdf_file = io.BytesIO(response.content) # o/p binary content to file-like obj for pypdf2_reader
        reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page_num in range(len(reader.pages)):
            if re.search(r'\b(References)\b', reader.pages[page_num].extract_text(), re.IGNORECASE): # ignores capital cases. TODO: need a more extensive gating  
                break
            
            else:
                text += reader.pages[page_num].extract_text() + "\n\n"
            
        return text

    except Exception as e:
        print("Bad URL")

def simple_summary(content: str) -> str:
    """
    Takes in PDF message and returns a simple summarized paragraph of the paper
    """

    safe_decode = content.encode('utf-8', 'ignore').decode('utf-8')

    if not safe_decode:
        logger.info("No content")
        return None 
    
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [{
            "role": "system", 
            "content": "You are a helpful assistant that explains high level technical reports in layman terms." # dont need to line break inside a list 
                        "Ensure the output has 2 paragraphs, the first paragraph is a layman abstraction."
                        "THe second paragraph can be longer that contains the methodology and results. Also include explaining the methodology in simple terms." 
                        "Do not include formatting such as **<Abstract>** / **<Methodology>**. "
            }, # set role of assistant 
            {
                "role": "user",
                "content": safe_decode 
            }
        ],
        "max_tokens": 2048
    }
    response = requests.post(OR_ENDPOINT, headers=headers, json=data)

    return response.json()["choices"][0]["message"]["content"]

if __name__ == "__main__":
    from app.database.connection import get_db
    from app.database.paper import Paper

    # Update current DB 
    with next(get_db()) as db:

        papers = db.query(Paper).all()

        for paper in papers:
            if paper.link:
                logger.info(f"Processing paper: {paper.title}")
                content = extract_pdf_content(paper.link)
                
                summary = simple_summary(content)
                paper.layman_summary = summary
                db.commit()
                logger.info(f"Successfully updated summary for: {paper.title}")

        db.commit()
