import { useState, useEffect } from "react";
import PaperCard from "./PaperCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  date: string;
  citations: number;
  author?: string;
  categories?: string[];
}

type SortField = "citations" | "date";
type SortOrder = "asc" | "desc";

export default function BreakthroughPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("citations");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const papersPerPage = 6;

  useEffect(() => {
    async function fetchPapers() {
      const response = await fetch("/api/breakthrough-papers");
      const data = await response.json();
      setPapers(data);
    }
    fetchPapers();
  }, []);

  // Sort papers based on current sort field and order
  const sortedPapers = [...papers].sort((a, b) => {
    if (sortField === "citations") {
      return sortOrder === "desc" 
        ? b.citations - a.citations 
        : a.citations - b.citations;
    } else {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" 
        ? dateB - dateA 
        : dateA - dateB;
    }
  });

  // Pagination logic
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = sortedPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(papers.length / papersPerPage);

  const toggleSortOrder = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Breakthrough Papers</h2>
        
        <div className="flex items-center gap-2">
          <Select
            value={sortField}
            onValueChange={(value: SortField) => setSortField(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citations">Citations</SelectItem>
              <SelectItem value="date">Release Date</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="h-10 w-10"
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className={`h-4 w-4 transition-transform ${
              sortOrder === "asc" ? "rotate-180" : ""
            }`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPapers.map((paper) => (
          <PaperCard 
            key={paper.id} 
            {...paper}
            author="Research Team"
            categories={["AI", "Machine Learning", "Neural Networks"]}
            showCitations
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 mb-4">
          <Button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}