export const CATEGORIES = {
  "AI": {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  "NLP": {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
  "Computer Vision": {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  "Machine Learn": {
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
  },
  "Agents": {
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  },
  "Neural Networks": {
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
  }
} as const

export type CategoryType = keyof typeof CATEGORIES;

// Mapping from backend category codes to frontend category names
export const CATEGORY_MAPPING: Record<string, CategoryType> = {
  "cs.AI": "AI",
  "cs.CL": "NLP",
  "cs.CV": "Computer Vision",
  "cs.LG": "Machine Learn",
  "cs.MA": "Agents",
  "cs.NE": "Neural Networks"
};

// convert backend category to frontend category
export function mapCategory(backendCategory: string): CategoryType | null {
  return CATEGORY_MAPPING[backendCategory] || null;
}

// convert an array of backend categories to frontend categories
export function mapCategories(backendCategories: string[]): CategoryType[] {
  return backendCategories
    .map(mapCategory)
    .filter((category): category is CategoryType => category !== null);
}