export const CATEGORIES = [
    'AI',
    'Machine Learning',
    'Neural Networks',
    'Data Science',
    'Statistics',
    'Python',
    'Deep Learning',
    'Computer Vision',
    'NLP',
    'Robotics'
  ] as const;
  
  export type Category = typeof CATEGORIES[number];
  
  export const CATEGORY_COLORS: Record<Category, string> = {
    'AI': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Machine Learning': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Neural Networks': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Data Science': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Statistics': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Python': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'Deep Learning': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'Computer Vision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'NLP': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    'Robotics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
  } as const;