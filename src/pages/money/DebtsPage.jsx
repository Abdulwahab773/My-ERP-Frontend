import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, EmptyState, ListSkeleton, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { DEBT_TYPES } from '../../constants';
import { selectUser } from '../../features/auth/authSlice';
import {
  useCreateDebtRecordMutation,
  useGetDebtsQuery,
  useGetDebtSummaryQuery,
  useGetPeopleQuery,
  useUpdateDebtRecordMutation,
} from '../../features/debts/debtsApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate, initials } from '../../utils/format';
import { DebtForm } from './DebtForm';
import { MoneyNav } from './MoneyNav';

export function DebtsPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const search = useDebounce(query, 250);
  const { data, error, isLoading } = useGetDebtsQuery({ q: search || undefined, type: type || undefined, status: status || undefined });
  const { data: summaryData } = useGetDebtSummaryQuery();
  const { data: peopleData } = useGetPeopleQuery();
  const [createDebt, createState] = useCreateDebtRecordMutation();
  const [updateDebt, updateState] = useUpdateDebtRecordMutation();
  const items = data?.data?.items || [];
  const summary = summaryData?.data;

  async function save(payload) {
    try {
      if (editing) await updateDebt({ debtId: editing.id, ...payload }).unwrap();
      else await createDebt(payload).unwrap();
      push({ tone: 'success', title: 'Debt saved' });
      setOpen(false);
      setEditing(null);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save debt' });
    }
  }

  return (
    <div className="p-margin-mobile lg:p-margin-desktop overflow-y-auto pb-32 lg:pb-margin-desktop">
      <MoneyNav />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-on-background">Debt Management</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Track receivables and payables securely.</p>
        </div>
        <button type="button" className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg flex items-center gap-xs" onClick={() => { setEditing(null); setOpen(true); }}>
          <MsIcon name="add" className="text-[18px]" />
          Record debt
        </button>
      </div>

      {error ? <Alert tone="danger" title={error?.data?.message || 'Debts could not load'} /> : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
        <div className="bg-error-container border border-error/20 rounded-xl p-md">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-md text-label-md text-on-error-container uppercase">Total Overdue</span>
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <MsIcon name="priority_high" className="text-[18px]" />
            </div>
          </div>
          <span className="font-display-lg text-display-lg text-on-error-container tracking-tight">{formatCurrency(summary?.overdue || 0, currency)}</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Total Receivable</span>
            <MsIcon name="arrow_downward" className="text-primary" />
          </div>
          <span className="font-headline-md text-headline-md">{formatCurrency(summary?.receivable || 0, currency)}</span>
          <p className="font-body-sm text-on-surface-variant mt-1">Owed to you</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase">Total Payable</span>
            <MsIcon name="arrow_upward" className="text-secondary" />
          </div>
          <span className="font-headline-md text-headline-md">{formatCurrency(summary?.payable || 0, currency)}</span>
          <p className="font-body-sm text-on-surface-variant mt-1">You owe</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm bg-surface-bright">
          <h2 className="font-headline-md text-[18px]">Active Agreements</h2>
          <div className="flex gap-xs bg-surface-container-high p-1 rounded-lg">
            {[{ id: '', label: 'All' }, ...DEBT_TYPES.map((item) => ({ id: item.id, label: item.id === 'lent' ? 'Receivable' : 'Payable' }))].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`px-sm py-1 rounded font-label-md text-label-md ${type === item.id ? 'bg-surface-container-lowest text-on-background shadow-sm' : 'text-on-surface-variant'}`}
                onClick={() => setType(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <input className="st-input m-md w-[calc(100%-32px)]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" />
        {isLoading && !items.length ? (
          <div className="p-md"><ListSkeleton variant="row" count={4} /></div>
        ) : !items.length ? (
          <EmptyState icon="wallet" title="No debts yet" message="Add someone you lent to or borrowed from." actionLabel="Record debt" onAction={() => setOpen(true)} />
        ) : items.map((item) => {
          const paid = item.principal ? Math.min(100, ((item.principal - item.outstanding) / item.principal) * 100) : 0;
          return (
            <Link
              key={item.id}
              to={`/app/money/debts/${item.id}`}
              className="p-md border-b border-outline-variant hover:bg-surface-container-low grid grid-cols-1 md:grid-cols-12 gap-sm items-center relative"
            >
              {item.status === 'overdue' ? <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" /> : null}
              <div className="md:col-span-4 flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-label-md">
                  {initials(item.person)}
                </div>
                <div>
                  <div className="font-body-md font-medium">{item.person}</div>
                  <div className="font-body-sm text-on-surface-variant flex items-center gap-1">
                    <MsIcon name={item.type === 'lent' ? 'arrow_downward' : 'arrow_upward'} className={`text-[14px] ${item.type === 'lent' ? 'text-primary' : 'text-secondary'}`} />
                    {item.type === 'lent' ? 'Lent to' : 'Borrowed from'}
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col gap-1">
                <div className="flex justify-between font-data-mono text-[13px]">
                  <span>{formatCurrency(item.outstanding, currency)} <span className="text-on-surface-variant">outstanding</span></span>
                  <span className="text-on-surface-variant">of {formatCurrency(item.principal, currency)}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.type === 'lent' ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${paid}%` }} />
                </div>
              </div>
              <div className="md:col-span-3 flex md:flex-col justify-between md:items-end items-center gap-1">
                <div className={`px-2 py-0.5 rounded font-label-md text-[10px] uppercase ${item.status === 'overdue' ? 'bg-error-container text-on-error-container' : item.status === 'paid' ? 'bg-surface-variant text-on-surface-variant' : 'bg-secondary-container text-on-secondary-container'}`}>
                  {item.status}
                </div>
                <div className="font-body-sm text-on-surface-variant">{item.dueDate ? formatDate(item.dueDate) : '—'}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <Select className="mt-md max-w-xs" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Debt status">
        {['', 'active', 'partial', 'paid', 'overdue'].map((item) => (
          <option key={item} value={item}>{item || 'All statuses'}</option>
        ))}
      </Select>

      <DebtForm
        open={open}
        item={editing}
        people={peopleData?.data?.items || []}
        loading={createState.isLoading || updateState.isLoading}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={save}
      />
    </div>
  );
}
