import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch this data from a database
  const hotPapers = [
    { id: "1", title: "Hot Paper 1", abstract: "This is a summary of hot paper 1", date: "2023-05-01" },
    { id: "2", title: "Hot Paper 2", abstract: "This is a summary of hot paper 2", date: "2023-04-28" },
    { id: "3", title: "Hot Paper 3", abstract: "This is a summary of hot paper 3", date: "2023-04-25" },
  ]

  return NextResponse.json(hotPapers)
}

