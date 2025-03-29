import { fetchPapers } from '@/lib/api';
import PaperCard from '@/components/paper-card';
import PaginationControls from '@/components/pagination-controls';
import { Paper } from '@/lib/types';

const PAGE_SIZE = 9; // Define page size constant

export default async function HighlyCitedPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams['page'] ? Number(searchParams['page']) : 1;
  // const pageSize = searchParams['per_page'] ? Number(searchParams['per_page']) : PAGE_SIZE;

  const { papers: citedPapers, total_papers: totalPapers } = await fetchPapers(
    'cited',
    page,
    PAGE_SIZE
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Highly Cited Papers</h1>

      {citedPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citedPapers.map((paper) => (
             <PaperCard key={paper.link || paper.title} paper={paper} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          No highly cited papers found for this page.
        </p>
      )}

     {totalPapers > 0 && (
         <PaginationControls
            currentPage={page}
            pageSize={PAGE_SIZE}
            totalItems={totalPapers}
            baseUrl="/highly-cited" // Base URL for this page
        />
      )}
    </main>
  );
}