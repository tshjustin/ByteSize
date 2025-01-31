import Link from "next/link"
import { Flame, Award } from "lucide-react"

interface PaperCardProps {
  id: string
  title: string
  abstract: string
  date: string
  isHot?: boolean
  citations?: number
  showCitations?: boolean
}

export default function PaperCard({ id, title, abstract, date, isHot, citations, showCitations }: PaperCardProps) {
  return (
    <Link href={`/paper/${id}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {isHot && <Flame className="w-5 h-5 text-red-500" />}
          {showCitations && <Award className="w-5 h-5 text-yellow-500" />}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{abstract}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
          {showCitations && <p className="text-sm text-gray-500 dark:text-gray-400">Citations: {citations}</p>}
        </div>
      </div>
    </Link>
  )
}

