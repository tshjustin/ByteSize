import { fetchPapers } from '@/lib/api';
import PaperCard from '@/components/paper-card'; // Assuming PaperCard handles Paper type
import PaginationControls from '@/components/pagination-controls';
import CategorySearch from '@/components/category-search'; // Keep category search if used
import { Paper } from '@/lib/types'; // Import Paper type

const PAGE_SIZE = 9; // Define page size constant

export default async function RecentPapersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get page number from search params, default to 1
  const page = searchParams['page'] ? Number(searchParams['page']) : 1;
  // Could also get pageSize from searchParams if you want it user-configurable
  // const pageSize = searchParams['per_page'] ? Number(searchParams['per_page']) : PAGE_SIZE;

  // Fetch paginated data
  const { papers: recentPapers, total_papers: totalPapers } = await fetchPapers(
    'recent',
    page,
    PAGE_SIZE
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Recent Papers</h1>
      {/* <CategorySearch />  Keep if functionality exists */}

      {recentPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPapers.map((paper) => (
            // Ensure PaperCard component expects the correct Paper type props
            // Make sure paper.id is unique enough if used as key, or combine with link/title
            <PaperCard key={paper.link || paper.title} paper={paper} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          No recent papers found for this page.
        </p>
      )}

      {totalPapers > 0 && (
         <PaginationControls
            currentPage={page}
            pageSize={PAGE_SIZE}
            totalItems={totalPapers}
            baseUrl="/" // Base URL for this page
        />
       )}
    </main>
  );
}