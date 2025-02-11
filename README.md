# ByteSize
Making Academic Papers easier and more byte size to read 


### Requirements - Frontend  

F1. Add Search bar that shows present settings + FIltering ✔️

F2. Refactor const labels as there are duplicates ✔️

F3. Hovering abstract logic 

F4. Colour scheme + UI/UX 

F5. User Experience 

### Requirements - Backend 

F1: Papers are scraped 00:00 each day and refreshes the feed. Scraped papers are saved into the database at the same time. ✔️

F2: Saved Papers are stored in the database, holding up to <?> time worth of data. ✔️ 

F2.1: If a Paper is saved by the User, then it would be persistently stored on LS, rather than backend ✔️

F2.2: Breakthrough papers are saved permenantly on the backend server. This ensures the papers are saved beyond <?> time. (Fetch Breakthroughs First)

F3: Users can be perform 2 search: [Manual] Search / [Filter] Search

F3.1: [Manual] Search: Leverages on Arxiv API calls - Ensure comprehensivness such that it handles either 1. Title inputs 2. Author Name inputs 3. Categorical inputs etc .. 

F3.2: [Filter] Search: Leverages on daily updated search 

F4: Abstracts / Summary of papers are made to more byte size for easier reading 

F5: Packaging of endpoint payloads such that above are satisfied.

### Flow: 

1. Try API calling and schema ✔️

2. Summarization and packaging. Database choice if needed 

3. Packaging of payload to send to FE 

4. API set ups

5. Sockets if needed 
