import { useMemo, useState } from 'react';
import { SearchInput } from './SearchInput';
import { Table } from './Table';
import { Pagination } from './Pagination';

export function DataTable({ columns, rows, pageSize = 8, searchable = true, searchKeys }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const needle = query.toLowerCase();
    return rows.filter((row) => {
      const keys = searchKeys || columns.map((column) => column.key);
      return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle));
    });
  }, [rows, query, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="datatable">
      {searchable ? (
        <div className="datatable-toolbar">
          <SearchInput value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        </div>
      ) : null}
      <Table columns={columns} rows={pageRows} />
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
