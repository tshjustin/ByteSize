import { NextResponse } from "next/server"
import { Paper } from "@/components/papers/types"

export async function GET() {
  // In a real application, you would fetch this data from a database
  const papers: Paper[] = [
    {
      id: "1",
      title: "Advanced Deep Learning Applications in Computer Vision",
      abstract: "This paper explores cutting-edge applications of deep learning in computer vision, focusing on recent breakthroughs in object detection and scene understanding.",
      date: "2024-02-14",
      isHot: true,
      citations: 1250,
      author: "Dr. Sarah Chen",
      categories: ["AI", "Computer Vision", "Deep Learning"]
    },
    {
      id: "2",
      title: "Natural Language Processing with Transformer Architecture",
      abstract: "A comprehensive study of transformer architectures in NLP, examining their impact on language understanding and generation tasks.",
      date: "2024-02-10",
      citations: 890,
      author: "Dr. Michael Rodriguez",
      categories: ["AI", "NLP", "Deep Learning"]
    },
    {
      id: "3",
      title: "Statistical Methods in Machine Learning",
      abstract: "This paper presents novel statistical approaches to improve machine learning model performance and reliability.",
      date: "2024-02-08",
      citations: 567,
      author: "Dr. Emily Williams",
      categories: ["Machine Learning", "Statistics"]
    },
    {
      id: "4",
      title: "Robotics and Computer Vision Integration",
      abstract: "An exploration of integrating computer vision systems with robotic control for improved automation and interaction.",
      date: "2024-02-05",
      citations: 423,
      author: "Dr. James Lee",
      categories: ["Robotics", "Computer Vision"]
    },
    {
      id: "5",
      title: "Python-based Data Science Workflows",
      abstract: "A detailed examination of efficient data science workflows using Python and modern tools.",
      date: "2024-02-01",
      citations: 312,
      author: "Dr. Lisa Anderson",
      categories: ["Data Science", "Python"]
    }
  ]

  return NextResponse.json(papers)
}