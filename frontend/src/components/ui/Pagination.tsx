import { Button } from './Button';
import { MaterialIcon } from '../icons/MaterialIcon';
import type { Pagination as PaginationMeta } from '../../types/api';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-md py-sm">
      <span className="text-body-sm text-on-surface-variant">
        Showing {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-sm">
        <Button
          variant="icon"
          className="bg-surface-container-lowest border border-outline-variant"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <MaterialIcon name="chevron_left" />
        </Button>
        <span className="text-body-sm text-on-surface-variant">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="icon"
          className="bg-surface-container-lowest border border-outline-variant"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <MaterialIcon name="chevron_right" />
        </Button>
      </div>
    </div>
  );
}
