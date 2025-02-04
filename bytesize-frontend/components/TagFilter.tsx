import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/constants/categories";

interface TagFilterProps {
  onFilterChange: (selectedTags: Category[]) => void;
}

export default function TagFilter({ onFilterChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = CATEGORIES.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (tag: Category) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  const clearTag = (tag: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTag(tag);
  };

  return (
    <div className="relative w-full max-w-4xl mb-6" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="flex items-center border rounded-lg bg-background dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <div className="flex-1 flex flex-wrap gap-2 p-2 min-h-10">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${CATEGORY_COLORS[tag]}`}
                >
                  {tag}
                  <button
                    onClick={(e) => clearTag(tag, e)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={selectedTags.length === 0 ? "Search tags..." : ""}
                className="flex-1 outline-none bg-transparent min-w-[120px] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={() => setIsOpen(true)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-background dark:bg-gray-800 border rounded-lg shadow-lg">
              <div className="p-2">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">Available Tags</h3>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => {
                        setSelectedTags([]);
                        onFilterChange([]);
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                  {filteredCategories.map(category => (
                    <button
                      key={category}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                        CATEGORY_COLORS[category]
                      } ${
                        selectedTags.includes(category) 
                          ? 'ring-2 ring-blue-500 ring-opacity-50' 
                          : 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-30'
                      }`}
                      onClick={() => toggleTag(category)}
                    >
                      <span className="truncate">{category}</span>
                      {selectedTags.includes(category) && (
                        <Check className="h-3 w-3 ml-1 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}