import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch this data from a database
  const papers = [
    { id: "1", title: "Hot Paper 1", abstract: "This is a summary of hot paper 1", date: "2023-05-01", isHot: true },
    { id: "2", title: "Hot Paper 2", abstract: "This is a summary of hot paper 2", date: "2023-04-28", isHot: true },
    { id: "3", title: "Hot Paper 3", abstract: "This is a summary of hot paper 3", date: "2023-04-25", isHot: true },
    { id: "4", title: "Recent Paper 1", abstract: "This is a summary of recent paper 1", date: "2023-04-22" },
    { id: "5", title: "Recent Paper 2", abstract: "This is a summary of recent paper 2", date: "2023-04-20" },
    { id: "6", title: "Recent Paper 3", abstract: "This is a summary of recent paper 3", date: "2023-04-18" },
    { id: "7", title: "Recent Paper 4", abstract: "This is a summary of recent paper 4", date: "2023-04-15" },
    { id: "8", title: "Recent Paper 5", abstract: "This is a summary of recent paper 5", date: "2023-04-12" },
    // Add more papers here
  ]

  return NextResponse.json(papers)
}

