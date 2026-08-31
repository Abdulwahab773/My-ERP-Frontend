import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, EmptyState, ListSkeleton, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { ACCOUNTS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants';
import { selectUser } from '../../features/auth/authSlice';
import {
  useCreateExpenseRecordMutation,
  useCreateIncomeRecordMutation,
  useGetLedgerQuery,
} from '../../features/finance/financeApi';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate, todayIso } from '../../utils/format';
import { MoneyNav } from './MoneyNav';
import { isOnline } from '../../pwa/offline';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
];

function categoryIcon(row) {
  if (row.type === 'income') return 'work';
  if (row.category === 'Food') return 'shopping_cart';
  if (row.category === 'Bills' || row.category === 'Utilities') return 'bolt';
  return 'receipt_long';
}

export function TransactionsPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [kind, setKind] = useState('expense');
  const [form, setForm] = useState({
    amount: '',
    title: '',
    account: 'bank',
    category: 'Food',
    date: todayIso(),
    note: '',
  });
  const search = useDebounce(query, 250);
  const { data, error, isLoading } = useGetLedgerQuery({
    q: search || undefined,
    type: type || undefined,
  });
  const [createIncome, incomeState] = useCreateIncomeRecordMutation();
  const [createExpense, expenseState] = useCreateExpenseRecordMutation();
  const rows = data?.data?.transactions || [];

  const grouped = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = formatDate(row.occurredAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return [...map.entries()];
  }, [rows]);

  const categories = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const saving = incomeState.isLoading || expenseState.isLoading;
  const symbol = new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(0).find((part) => part.type === 'currency')?.value || '$';

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        account: form.account,
        date: form.date,
        note: form.note,
      };
      if (kind === 'income') {
        await createIncome({
          ...payload,
          cashAmount: form.account === 'cash' ? Number(form.amount) : 0,
          bankAmount: form.account === 'bank' ? Number(form.amount) : 0,
        }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      push({ tone: 'success', title: 'Transaction saved' });
      setForm((current) => ({ ...current, amount: '', title: '', note: '' }));
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save transaction' });
    }
  }

  return (
    <div className="pt-4 pb-[88px] md:pb-lg px-margin-mobile md:px-margin-desktop w-full max-w-[1440px] mx-auto flex flex-col gap-lg lg:flex-row">
      <section className="flex-grow flex flex-col gap-md min-w-0 lg:w-2/3">
        <MoneyNav />
        <div className="flex flex-col sm:flex-row gap-sm items-center justify-between bg-surface p-sm rounded-xl border border-outline-variant shadow-sm">
          <div className="relative w-full sm:w-64">
            <MsIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3 py-2 text-body-sm focus:ring-1 focus:ring-primary"
              placeholder="Search transactions..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-xs w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${type === item.id ? 'bg-primary-container text-on-primary-container' : 'border border-outline-variant text-on-surface-variant'}`}
                onClick={() => setType(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-md py-sm border-b border-surface-variant bg-surface-container-lowest flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md font-semibold text-[18px]">Recent Transactions</h3>
            <div className="flex items-center gap-xs text-secondary text-body-sm">
              <MsIcon name="sync" className="text-[18px]" />
              <span>{isOnline() ? 'All synced' : 'Offline'}</span>
            </div>
          </div>
          {error ? <Alert tone="danger" title={error?.data?.message || 'Ledger could not load'} /> : null}
          {isLoading && !rows.length ? (
            <div className="p-md"><ListSkeleton variant="row" count={5} /></div>
          ) : !grouped.length ? (
            <EmptyState icon="wallet" title="No ledger rows yet" message="Add income or an expense to see it here." />
          ) : grouped.map(([day, items]) => (
            <div key={day}>
              <div className="px-md py-xs bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{day}</div>
              {items.map((row) => (
                <div key={row.id || row.txnId} className="px-md py-sm flex justify-between items-center border-b border-surface-container">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                      <MsIcon name={categoryIcon(row)} />
                    </div>
                    <div>
                      <h4 className="font-body-md text-body-md font-medium">{row.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{row.category} · {row.account === 'bank' ? 'Bank' : 'Cash'}</p>
                    </div>
                  </div>
                  <span className={`font-data-mono text-data-mono ${row.direction === 'in' ? 'text-primary' : 'text-on-background'}`}>
                    {row.direction === 'in' ? '+' : '-'}{formatCurrency(row.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <aside className="w-full lg:w-1/3 flex flex-col gap-md">
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
          <h3 className="font-headline-md text-headline-md font-semibold mb-md border-b border-surface-variant pb-xs">New Transaction</h3>
          <form className="flex flex-col gap-md" onSubmit={save}>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button type="button" className={`flex-1 py-1.5 font-label-md text-label-md rounded-md ${kind === 'income' ? 'bg-surface text-on-background shadow-sm border border-outline-variant' : 'text-on-surface-variant'}`} onClick={() => setKind('income')}>Income</button>
              <button type="button" className={`flex-1 py-1.5 font-label-md text-label-md rounded-md ${kind === 'expense' ? 'bg-surface text-on-background shadow-sm border border-outline-variant' : 'text-on-surface-variant'}`} onClick={() => setKind('expense')}>Expense</button>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">{symbol}</span>
                <input name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={update} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 py-2 font-data-mono text-lg" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Title</label>
              <input name="title" required value={form.title} onChange={update} className="st-input" placeholder="e.g. Groceries" />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Account</label>
              <div className="flex gap-sm">
                {ACCOUNTS.map((account) => (
                  <label key={account.id} className={`flex-1 border rounded-lg p-2 flex items-center justify-center gap-xs cursor-pointer ${form.account === account.id ? 'bg-primary-container text-on-primary-container border-primary' : 'border-outline-variant'}`}>
                    <input className="sr-only" type="radio" name="account" value={account.id} checked={form.account === account.id} onChange={update} />
                    <MsIcon name={account.id === 'bank' ? 'account_balance' : 'payments'} className="text-[18px]" />
                    <span className="font-label-md text-label-md">{account.id === 'bank' ? 'Bank' : 'Cash'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-md">
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Category</label>
                <Select name="category" value={form.category} onChange={update} placeholder="Select category">
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </div>
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Date</label>
                <input name="date" type="date" value={form.date} onChange={update} className="st-input" />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Note (Optional)</label>
              <textarea name="note" rows="2" value={form.note} onChange={update} className="st-input resize-none" placeholder="Optional note" />
            </div>
            <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Transaction'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
