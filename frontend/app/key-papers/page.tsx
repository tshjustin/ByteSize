import Navigation from "@/components/Navigation"
import KeyPaperList from "@/components/KeyPaperList"

export default function KeyPapers() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Key Papers</h1>
      <Navigation />
      <KeyPaperList />
    </main>
  )
}

