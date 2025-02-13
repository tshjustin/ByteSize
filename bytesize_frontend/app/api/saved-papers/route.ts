import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch this data from a database based on the user's saved papers
  const savedPapers = [
    { id: "1", title: "Saved Paper 1", abstract: "This is a summary of saved paper 1", date: "2023-03-15" },
    { id: "2", title: "Saved Paper 2", abstract: "This is a summary of saved paper 2", date: "2023-02-28" },
    { id: "3", title: "Saved Paper 3", abstract: "This is a summary of saved paper 3", date: "2023-01-10" },
    // Add more saved papers here
  ]

  return NextResponse.json(savedPapers)
}

