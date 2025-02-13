import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch this data from a database
  const breakthroughPapers = [
    {
      id: "1",
      title: "Breakthrough Paper 1",
      abstract: "This is a summary of breakthrough paper 1",
      date: "2022-01-15",
      citations: 75000,
    },
    {
      id: "2",
      title: "Breakthrough Paper 2",
      abstract: "This is a summary of breakthrough paper 2",
      date: "2021-11-30",
      citations: 62000,
    },
    {
      id: "3",
      title: "Breakthrough Paper 3",
      abstract: "This is a summary of breakthrough paper 3",
      date: "2021-09-22",
      citations: 58000,
    },
    // Add more breakthrough papers here
  ]

  return NextResponse.json(breakthroughPapers)
}

