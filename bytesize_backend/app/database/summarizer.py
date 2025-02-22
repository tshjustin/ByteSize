import os 
import re
import io 
import PyPDF2
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OAI_KEY = os.getenv("OAI_KEY")

client = OpenAI(api_key=OAI_KEY)

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
            if re.search(r'\b(Conclusion)\b', reader.pages[page_num].extract_text(), re.IGNORECASE): # ignores capital cases. TODO: need a more extensive gating  
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
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system", 
            "content": "You are a helpful assistant that explains high level technical reports in layman terms. Ensure the output has 2 paragraphs, the \
                        first paragraph is a layman abstraction, and the second can be longer that contains the methodology and results."
            }, # set role of assistant 
            {
                "role": "user",
                "content": content 
            }
        ]
    )

    return completion.choices[0].message.content 

if __name__ == "__main__":
    txt = extract_pdf_content("https://arxiv.org/abs/2502.13141v1")
    print(simple_summary(txt))