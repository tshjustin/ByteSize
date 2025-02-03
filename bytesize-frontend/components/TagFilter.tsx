import React, { useState } from 'react';
import { Check } from "lucide-react";

interface TagFilterProps {
  onFilterChange: (selectedTags: string[]) => void;
}

// Relook at the const category and put it somewhere constant-y
const categories = [
  'AI', 'Machine Learning', 'Neural Networks', 'Data Science', 'Statistics',
  'Python', 'Deep Learning', 'Computer Vision', 'NLP', 'Robotics'
];

const categoryColors: { [key: string]: string } = {
  'AI': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Machine Learning': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Neural Networks': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Data Science': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Statistics': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Python': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Deep Learning': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'Computer Vision': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'NLP': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'Robotics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
};

export default function TagFilter({ onFilterChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  return (
    <div className="relative w-full max-w-2xl mb-4">
      <div 
        className="border rounded-lg p-2 min-h-[40px] cursor-pointer bg-white dark:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${categoryColors[tag]}`}
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTag(tag);
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Search tags..."
            className="flex-1 outline-none bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          <div className="p-2 grid grid-cols-5 gap-2">
            {filteredCategories.map(category => (
              <button
                key={category}
                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center justify-between ${
                  categoryColors[category]
                } ${
                  selectedTags.includes(category) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => toggleTag(category)}
              >
                <span className="truncate">{category}</span>
                {selectedTags.includes(category) && (
                  <Check className="w-3 h-3 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}