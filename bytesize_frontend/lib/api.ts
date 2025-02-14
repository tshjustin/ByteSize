// API endpoints for external paper search
export const EXTERNAL_API_ENDPOINTS = {
  arxiv: "https://api.example.com/arxiv/search",
  semanticScholar: "https://api.example.com/semantic-scholar/search"
} as const

export interface ExternalPaper extends Omit<Paper, 'categories'> {
  categories: string[]
  source: 'arxiv' | 'semanticScholar'
  url: string
}

export async function searchExternalPapers(query: string): Promise<ExternalPaper[]> {
  try {
    const [arxivResults, semanticScholarResults] = await Promise.all([
      fetch(`${EXTERNAL_API_ENDPOINTS.arxiv}?q=${encodeURIComponent(query)}`),
      fetch(`${EXTERNAL_API_ENDPOINTS.semanticScholar}?q=${encodeURIComponent(query)}`)
    ])

    const arxivData = await arxivResults.json()
    const semanticScholarData = await semanticScholarResults.json()

    // Combine and normalize results
    return [...arxivData, ...semanticScholarData]
  } catch (error) {
    console.error('Error fetching external papers:', error)
    return []
  }
}