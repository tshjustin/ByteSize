import { useState, useEffect, useMemo } from "react";
import Fuse from 'fuse.js';
import PaperCard from "./PaperCard";
import SearchBar from "./SearchBar";
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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => new Fuse(papers, {
    keys: ['title', 'abstract'],
    threshold: 0.3, // Lower threshold = more strict matching
    includeScore: true
  }), [papers]);

  // Filter papers based on search query
  const filteredPapers = useMemo(() => {
    if (!searchQuery) return papers;
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, papers, fuse]);

  // Sort filtered papers
  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => {
      if (sortField === "citations") {
        return sortOrder === "desc" 
          ? b.citations - a.citations 
          : a.citations - b.citations;
      } else {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" 
          ? dateB - dateA 
          : dateA - dateB;
      }
    });
  }, [filteredPapers, sortField, sortOrder]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = sortedPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(sortedPapers.length / papersPerPage);

  const toggleSortOrder = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Breakthrough Papers</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Search papers by title or abstract..."
          />
          
          <div className="flex items-center gap-2 ml-auto">
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
      </div>

      {sortedPapers.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No papers found matching your search.
        </div>
      ) : (
        <>
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
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}