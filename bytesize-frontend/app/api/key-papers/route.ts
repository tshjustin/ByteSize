import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch this data from a database
  const keyPapers = [
    { id: "1", title: "Key Paper 1", abstract: "This is a summary of key paper 1", date: "2023-01-15" },
    { id: "2", title: "Key Paper 2", abstract: "This is a summary of key paper 2", date: "2022-11-30" },
    // Add more key papers here
  ]

  return NextResponse.json(keyPapers)
}

