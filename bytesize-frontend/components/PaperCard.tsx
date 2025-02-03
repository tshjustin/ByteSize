import Link from "next/link"
import { Flame, Award } from "lucide-react"

const categoryColors: { [key: string]: string } = {
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
}

interface PaperCardProps {
  id: string
  title: string
  abstract: string
  date: string
  isHot?: boolean
  citations?: number
  showCitations?: boolean
  author?: string
  categories?: string[]
}

export default function PaperCard({ 
  id, 
  title, 
  abstract, 
  date, 
  isHot, 
  citations, 
  showCitations,
  author = "Author Name",
  categories = []
}: PaperCardProps) {
  return (
    <Link href={`/paper/${id}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-[300px] flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
          {isHot && <Flame className="w-5 h-5 text-red-500 shrink-0" />}
          {showCitations && <Award className="w-5 h-5 text-yellow-500 shrink-0" />}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{author}</div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((category, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              {category}
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-4 text-sm">
          {abstract}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
          {showCitations && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Citations: {citations}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}