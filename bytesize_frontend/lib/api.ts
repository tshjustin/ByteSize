import { Paper } from './types'; // Assuming you have a types file

// Define the expected structure of the API response for paginated papers
export interface PaginatedPapersResponse {
  papers: Paper[];
  total_papers: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Fallback for local dev

export async function fetchPapers(
  type: 'recent' | 'cited', // Use specific types
  page: number = 1,
  pageSize: number = 9
): Promise<PaginatedPapersResponse> {
  try {
    // Construct the URL with pagination query parameters
    const url = `${API_URL}/api/papers/${type}?page=${page}&page_size=${pageSize}`;
    console.log("Fetching papers from:", url); // Log the URL being fetched

    const res = await fetch(url, { cache: 'no-store' }); // Disable caching for dynamic data

    if (!res.ok) {
      // Log more details on error
      const errorBody = await res.text();
      console.error(`API Error (${res.status}): ${errorBody}`);
      throw new Error(`Failed to fetch ${type} papers (status: ${res.status})`);
    }

    const data: PaginatedPapersResponse = await res.json();
    console.log(`Fetched ${data.papers.length} ${type} papers (Total: ${data.total_papers}) for page ${page}`);

     // Optional: Add basic validation on the returned data
     if (!data || !Array.isArray(data.papers) || typeof data.total_papers !== 'number') {
      console.error("Invalid data structure received from API:", data);
      throw new Error("Invalid data format received from API");
    }

    return data;
  } catch (error) {
    console.error(`Error in fetchPapers (${type}, page ${page}):`, error);
    // Return a default structure on error to prevent crashes downstream
    // Or re-throw if the calling component handles errors robustly
    return { papers: [], total_papers: 0 };
  }
}


export async function searchPapers(
    option: 'title' | 'author',
    query: string,
    maxResults: number = 10 // Keep maxResults for search for now
  ): Promise<Paper[]> { // Search still returns just the array for now
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${API_URL}/api/search/${option}/${encodedQuery}?max_results=${maxResults}`;
      console.log("Searching papers:", url);

      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`API Search Error (${res.status}): ${errorBody}`);
        throw new Error(`Failed to search papers (status: ${res.status})`);
      }

      const data: Paper[] = await res.json(); // Expecting direct array for search
      console.log(`Found ${data.length} papers matching search.`);

      if (!Array.isArray(data)) {
        console.error("Invalid search data structure received:", data);
        throw new Error("Invalid search data format received");
      }
      return data;
    } catch (error) {
      console.error(`Error in searchPapers (query: ${query}):`, error);
      return []; // Return empty array on error
    }
  }

// Add other API functions if needed (e.g., save paper, fetch saved papers if backend handles it)

// Health check ping
export async function pingServer(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/ping`);
    return response.ok;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false;
  }
}