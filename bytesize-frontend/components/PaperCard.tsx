import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Bookmark } from "lucide-react";
import { CATEGORY_COLORS, type Category } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaperCardProps {
  id: string;
  title: string;
  abstract: string;
  date: string;
  isHot?: boolean;
  citations?: number;
  showCitations?: boolean;
  author?: string;
  categories?: Category[];
}

export default function PaperCard({ 
  id, 
  title, 
  abstract, 
  date, 
  isHot, 
  citations, 
  showCitations,
  author = "Author Name",
  categories = []
}: PaperCardProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));

  // Check if paper is saved on component mount
  useEffect(() => {
    const savedPapers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
    setIsSaved(savedPapers.some((paper: any) => paper.id === id));
  }, [id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    const savedPapers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
    
    if (isSaved) {
      // Remove paper from saved papers
      const updatedPapers = savedPapers.filter((paper: any) => paper.id !== id);
      localStorage.setItem('savedPapers', JSON.stringify(updatedPapers));
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('savedPapersUpdate', {
        detail: { papers: updatedPapers }
      }));
      setIsSaved(false);
      toast({
        title: "Paper removed",
        description: "Paper has been removed from your saved papers",
      });
    } else {
      // Add paper to saved papers
      const paperToSave = {
        id,
        title,
        abstract,
        date,
        isHot,
        citations,
        author,
        categories
      };
      const updatedPapers = [...savedPapers, paperToSave];
      localStorage.setItem('savedPapers', JSON.stringify(updatedPapers));
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('savedPapersUpdate', {
        detail: { papers: updatedPapers }
      }));
      setIsSaved(true);
      toast({
        title: "Paper saved",
        description: "Paper has been added to your saved papers",
      });
    }
  };

  return (
    <Link href={`/paper/${id}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-[300px] flex flex-col relative group">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={toggleSave}
        >
          <Bookmark 
            className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} 
          />
        </Button>

        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold line-clamp-2 pr-8">{title}</h2>
          {showCitations && <Award className="w-5 h-5 text-yellow-500 shrink-0" />}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{author}</div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {sortedCategories.map((category, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {category}
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-4 text-sm">
          {abstract}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
          {showCitations && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Citations: {citations}
            </p>
          )}
        </div>

        {isHot && (
          <div className="absolute bottom-4 right-4">
            <div className="animate-pulse transform hover:scale-110 transition-transform text-2xl" style={{ animation: "flame 0.5s infinite alternate" }}>
              🔥
            </div>
            <style jsx>{`
              @keyframes flame {
                from {
                  transform: scale(1) rotate(-5deg);
                }
                to {
                  transform: scale(1.1) rotate(5deg);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </Link>
  );
}