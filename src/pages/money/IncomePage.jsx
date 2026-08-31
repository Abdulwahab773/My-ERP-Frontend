import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, ConfirmationDialog, EmptyState, ListSkeleton, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import {
  useCreateIncomeRecordMutation,
  useDeleteIncomeRecordMutation,
  useGetCategoriesQuery,
  useGetIncomeQuery,
  useUpdateIncomeRecordMutation,
} from '../../features/finance/financeApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/format';
import { IncomeForm } from './IncomeForm';
import { MoneyNav } from './MoneyNav';

export function IncomePage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const search = useDebounce(query, 250);
  useEffect(() => { setPage(1); }, [search, category]);
  const { data, error, isLoading } = useGetIncomeQuery({
    q: search || undefined,
    category: category || undefined,
    page,
    limit: 50,
  });
  const { data: catData } = useGetCategoriesQuery({ kind: 'income' });
  const [createItem, createState] = useCreateIncomeRecordMutation();
  const [updateItem, updateState] = useUpdateIncomeRecordMutation();
  const [deleteItem, deleteState] = useDeleteIncomeRecordMutation();
  const items = data?.data?.items || [];
  const meta = data?.meta;
  const categories = useMemo(() => (catData?.data?.categories || []).map((item) => item.name), [catData]);

  async function save(payload) {
    try {
      const result = editing
        ? await updateItem({ incomeId: editing.id, ...payload }).unwrap()
        : await createItem(payload).unwrap();
      push({
        tone: 'success',
        title: result.meta?.offline ? 'Saved offline' : 'Income saved',
        message: result.meta?.offline ? 'It will sync when you are back online.' : undefined,
      });
      setOpen(false);
      setEditing(null);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save income' });
    }
  }

  return (
    <div className="st-page">
      <MoneyNav />
      <header className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="st-page-title">Income</h1>
          <p className="st-page-lead">Split deposits between cash in hand and your bank account.</p>
        </div>
        <button
          type="button"
          className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl flex items-center gap-xs shadow-sm shrink-0"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          <MsIcon name="add" className="text-[18px]" />
          Add income
        </button>
      </header>

      {error ? <Alert tone="danger" title={error?.data?.message || 'Income could not load'} /> : null}

      <div className="money-toolbar mb-lg">
        <div className="money-search">
          <MsIcon name="search" />
          <input
            className="st-input"
            placeholder="Search income"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>

      {isLoading && !items.length ? (
        <ListSkeleton variant="row" count={5} />
      ) : !items.length ? (
        <EmptyState icon="wallet" title="No income yet" message="Record a deposit and choose how it lands in cash or bank." actionLabel="Add income" onAction={() => setOpen(true)} />
      ) : (
        <div className="money-list">
          {items.map((row) => (
            <article key={row.id} className="money-row">
              <div className="money-row-icon" aria-hidden="true">
                <MsIcon name="work" className="text-[20px]" />
              </div>
              <div className="money-row-copy min-w-0">
                <h4 className="truncate">{row.title || 'Untitled'}</h4>
                <div className="money-row-meta">
                  <span className="money-chip">{row.category || 'Other'}</span>
                  <span>{formatCurrency(row.cashAmount, currency)} cash</span>
                  <span>{formatCurrency(row.bankAmount, currency)} bank</span>
                  <span>{formatDate(row.occurredAt)}</span>
                </div>
              </div>
              <strong className="money-row-amount">{formatCurrency(row.amount, currency)}</strong>
              <div className="money-row-actions">
                <button
                  type="button"
                  className="money-icon-btn"
                  aria-label="Edit income"
                  onClick={() => { setEditing(row); setOpen(true); }}
                >
                  <MsIcon name="edit" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  className="money-icon-btn is-danger"
                  aria-label="Delete income"
                  onClick={() => setRemoving(row)}
                >
                  <MsIcon name="delete" className="text-[18px]" />
                </button>
              </div>
            </article>
          ))}
          {meta?.total > items.length || meta?.page > 1 ? (
            <div className="money-list-foot">
              <p className="font-body-sm text-on-surface-variant">Page {meta.page} · {items.length} of {meta.total}</p>
              <div className="flex gap-xs">
                <Button size="sm" variant="secondary" disabled={meta.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={!meta.hasMore} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <IncomeForm
        open={open}
        item={editing}
        categories={categories.length ? categories : ['Other']}
        loading={createState.isLoading || updateState.isLoading}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={save}
      />
      <ConfirmationDialog
        open={Boolean(removing)}
        title="Delete this income?"
        message="The ledger and both account balances will be reversed."
        loading={deleteState.isLoading}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await deleteItem(removing.id).unwrap();
            setRemoving(null);
            push({ tone: 'success', title: 'Income deleted' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete' });
          }
        }}
      />
    </div>
  );
}
