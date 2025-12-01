import Link from 'next/link';

export type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
};

function buildLink(page: number, limit: number, total: number, basePath: string, searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else {
      params.set(key, value);
    }
  });
  params.set('page', String(page));
  params.set('limit', String(limit));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ page, limit, total, searchParams, basePath }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="panel pagination">
      <div>Page {page} of {totalPages} • {total} cards</div>
      <div className="pagination-links">
        <Link
          href={buildLink(prevPage, limit, total, basePath, searchParams)}
          aria-disabled={page === 1}
          className={`pagination-link ${page === 1 ? 'disabled' : ''}`}
        >
          Previous
        </Link>
        <Link
          href={buildLink(nextPage, limit, total, basePath, searchParams)}
          aria-disabled={page === totalPages}
          className={`pagination-link ${page === totalPages ? 'disabled' : ''}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
