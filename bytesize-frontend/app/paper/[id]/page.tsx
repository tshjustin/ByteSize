import Link from "next/link"
import { ArrowLeft, Flame } from "lucide-react"

async function getPaper(id: string) {
  // In a real application, you would fetch this data from a database or API
  return {
    id,
    title: `Paper ${id}`,
    abstract: `This is the full abstract of paper ${id}.`,
    content: `This is the full content of paper ${id}. It would contain the entire text of the research paper.`,
    date: "2023-05-01",
    isHot: id === "1" || id === "3", // Example condition for hot papers
  }
}

export default async function PaperPage({ params }: { params: { id: string } }) {
  const paper = await getPaper(params.id)

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to papers
      </Link>
      <article className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{paper.title}</h1>
          {paper.isHot && <Flame className="w-6 h-6 text-red-500" />}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{paper.date}</p>
        <h2 className="text-xl font-semibold mb-2">Abstract</h2>
        <p className="mb-6">{paper.abstract}</p>
        <h2 className="text-xl font-semibold mb-2">Content</h2>
        <p>{paper.content}</p>
      </article>
    </main>
  )
}

