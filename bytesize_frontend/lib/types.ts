// Define a shared type for Paper data
export interface Paper {
    id: number | null; // ID might be null for arXiv results initially
    title: string;
    authors: string[];
    published: string | null; // Keep as ISO string from backend
    summary: string | null;
    layman_summary: string | null;
    link: string;
    categories: string[] | null;
    citations: number | null;
  }