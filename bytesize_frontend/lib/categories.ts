// Define category types and their associated colors
export const CATEGORIES = {
  "LLM": {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  "Finetuning": {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
  "Computer Vision": {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  "NLP": {
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
  },
  "Reinforcement Learning": {
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
  "Neural Networks": {
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100",
  },
  "MLOps": {
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  },
  "Ethics": {
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
  }
} as const

export type CategoryType = keyof typeof CATEGORIES