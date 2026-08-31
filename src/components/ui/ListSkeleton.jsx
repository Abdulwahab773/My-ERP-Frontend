import { Skeleton } from './Skeleton';

const COUNTS = { row: 5, tile: 4, card: 4, note: 5, line: 6, table: 5 };

export function ListSkeleton({ variant = 'row', count, className = '' }) {
  const items = Array.from({ length: count || COUNTS[variant] || 4 }, (_, index) => index);

  if (variant === 'tile') {
    return (
      <div className={`list-skeleton list-skeleton-tiles ${className}`.trim()} aria-busy="true" aria-label="Loading">
        {items.map((key) => (
          <div key={key} className="list-skeleton-tile">
            <Skeleton height={18} width="62%" />
            <Skeleton height={10} width="40%" />
            <Skeleton height={8} radius={99} />
            <Skeleton height={10} width="50%" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card' || variant === 'note') {
    return (
      <div className={`list-skeleton ${className}`.trim()} aria-busy="true" aria-label="Loading">
        {items.map((key) => (
          <div key={key} className="list-skeleton-card">
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="92%" />
            <Skeleton height={10} width="38%" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`list-skeleton ${className}`.trim()} aria-busy="true" aria-label="Loading">
        {items.map((key) => (
          <div key={key} className="list-skeleton-table-row">
            <Skeleton height={14} width="22%" />
            <Skeleton height={14} width="18%" />
            <Skeleton height={14} width="14%" />
            <Skeleton height={14} width="16%" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={`list-skeleton ${className}`.trim()} aria-busy="true" aria-label="Loading">
        {items.map((key) => (
          <Skeleton key={key} height={16} />
        ))}
      </div>
    );
  }

  return (
    <div className={`list-skeleton ${className}`.trim()} aria-busy="true" aria-label="Loading">
      {items.map((key) => (
        <div key={key} className="list-skeleton-row">
          <Skeleton height={40} width={40} radius={12} />
          <div className="list-skeleton-copy">
            <Skeleton height={14} width="56%" />
            <Skeleton height={10} width="34%" />
          </div>
          <Skeleton height={16} width={72} />
        </div>
      ))}
    </div>
  );
}
