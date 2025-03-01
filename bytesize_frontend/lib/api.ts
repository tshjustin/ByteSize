import { type Paper } from "@/hooks/use-saved-papers";
import { type CategoryType, mapCategories } from "@/lib/categories";

// Define the API base URL - can be changed in environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface ApiPaper {
  id: number;
  title: string;
  authors: string[];
  published: string;
  summary: string;
  layman_summary: string | null;
  link: string;
  categories: string[];
  citations: number;
}

// Convert API paper format to frontend Paper format
export function convertApiPaperToPaper(apiPaper: ApiPaper): Paper {
  // Map backend categories (cs.XX) to frontend categories
  const mappedCategories = mapCategories(apiPaper.categories || []);
  
  return {
    id: apiPaper.id?.toString() || Math.random().toString(36).substring(7),
    title: apiPaper.title,
    authors: apiPaper.authors || [],
    categories: mappedCategories,
    abstract: apiPaper.summary || "",
    publishedDate: apiPaper.published || new Date().toISOString(),
    laymanSummary: apiPaper.layman_summary || undefined,
    pdfUrl: apiPaper.link || "",
    citations: apiPaper.citations || 0
  };
}

// Fetch recent papers
export async function fetchRecentPapers(): Promise<Paper[]> {
  try {
    console.log("Fetching recent papers from:", `${API_BASE_URL}/api/papers/false`);
    const response = await fetch(`${API_BASE_URL}/papers/false`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: ApiPaper[] = await response.json();
    console.log("Recent papers data:", data);
    return data.map(convertApiPaperToPaper);
  } catch (error) {
    console.error('Error fetching recent papers:', error);
    return [];
  }
}

// Fetch highly cited papers
export async function fetchHighlyCitedPapers(): Promise<Paper[]> {
  try {
    console.log("Fetching highly cited papers from:", `${API_BASE_URL}/api/papers/true`);
    const response = await fetch(`${API_BASE_URL}/papers/true`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: ApiPaper[] = await response.json();
    console.log("Highly cited papers data:", data);
    return data.map(convertApiPaperToPaper);
  } catch (error) {
    console.error('Error fetching highly cited papers:', error);
    return [];
  }
}

// Search papers
export async function searchPapers(option: string, query: string): Promise<Paper[]> {
  try {
    // Ensure the search URL is properly encoded
    const safeOption = encodeURIComponent(option);
    const safeQuery = encodeURIComponent(query);
    
    // Add a max_results parameter to get more results when available
    const url = `${API_BASE_URL}/api/search/${safeOption}/${safeQuery}?max_results=20`;
    console.log("Searching with URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Search API returned status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Search response data:", data);
    
    // Handle potential array or object response
    const papersData = Array.isArray(data) ? data : [data];
    
    // Process the papers through the converter
    return papersData.map(convertApiPaperToPaper);
  } catch (error) {
    console.error('Error searching papers:', error);
    return [];
  }
}

// Health check ping
export async function pingServer(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ping`);
    return response.ok;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false;
  }
}