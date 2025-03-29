'use client';

import { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Use next/navigation
import { Button } from '@/components/ui/button'; // Assuming shadcn button

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number; 
  baseUrl: string;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  currentPage,
  pageSize,
  totalItems,
  baseUrl,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return; 
    }

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', String(newPage));
    current.set('per_page', String(pageSize)); // Keep per_page consistent if needed

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${baseUrl}${query}`);
  };

  // Don't render controls if there's only one page or no items
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
       {/* Optional: Add page number buttons if desired */}
       {/* Consider a more complex component for many pages */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;