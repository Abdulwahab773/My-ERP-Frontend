import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, ConfirmationDialog, Input, ListSkeleton, Loader, Modal, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import {
  useCloseMonthMutation,
  useGetMonthBookQuery,
  useGetMonthsQuery,
  useReopenMonthMutation,
} from '../../features/finance/financeApi';
import { currentMonthKey, formatCurrency, monthLabel } from '../../utils/format';
import { MoneyNav } from './MoneyNav';

export function MonthBookPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [month, setMonth] = useState(currentMonthKey);
  const [year, setYear] = useState(String(month).slice(0, 4));
  const [closing, setClosing] = useState(false);
  const [reopen, setReopen] = useState(false);
  const [reason, setReason] = useState('');
  const { data, error, isLoading } = useGetMonthBookQuery(month);
  const { data: monthsData } = useGetMonthsQuery();
  const [closeMonth, closeState] = useCloseMonthMutation();
  const [reopenMonth, reopenState] = useReopenMonthMutation();
  const book = data?.data;
  const closed = book?.status === 'closed';
  const months = monthsData?.data?.months || [];

  const yearMonths = useMemo(() => {
    const list = Array.isArray(months) ? months : [];
    return list.filter((item) => String(item.month || item).startsWith(year));
  }, [months, year]);

  const years = useMemo(() => {
    const values = new Set((Array.isArray(months) ? months : []).map((item) => String(item.month || item).slice(0, 4)));
    values.add(String(new Date().getFullYear()));
    return [...values].sort((a, b) => Number(b) - Number(a));
  }, [months]);

  async function confirmClose() {
    try {
      await closeMonth(month).unwrap();
      push({ tone: 'success', title: `${monthLabel(month)} is closed` });
      setClosing(false);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to close month' });
    }
  }

  async function confirmReopen() {
    try {
      await reopenMonth({ month, confirm: true, reason }).unwrap();
      push({ tone: 'success', title: `${monthLabel(month)} reopened` });
      setReopen(false);
      setReason('');
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to reopen month' });
    }
  }

  return (
    <div className="p-margin-mobile lg:p-margin-desktop">
      <MoneyNav />
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg hidden lg:block">Monthly Books</h1>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:hidden">Monthly Books</h1>
          <p className="font-body-sm text-on-surface-variant mt-2">Chronological ledger status and period closures.</p>
        </div>
        <Select className="w-[140px]" value={year} onChange={(event) => setYear(event.target.value)} aria-label="Year">
          {years.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>

      {error ? <Alert tone="danger" title={error?.data?.message || 'Month book could not load'} /> : null}

      {isLoading && !book ? (
        <ListSkeleton variant="card" count={3} />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Selected month</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Total Income</span>
                <span className="font-data-mono">{formatCurrency(book?.income?.total || 0, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-sm text-on-surface-variant">Total Expenses</span>
                <span className="font-data-mono">{formatCurrency(book?.expenses?.total || 0, currency)}</span>
              </div>
              <div className="h-px w-full bg-outline-variant" />
              <div className="flex justify-between">
                <span className="font-body-md font-semibold">Net Change</span>
                <span className="font-data-mono text-primary font-bold">{formatCurrency(book?.netChange || 0, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {(yearMonths.length ? yearMonths : [{ month, status: book?.status || 'open' }]).map((row) => {
            const key = row.month || month;
            const isOpen = (row.status || (key === month ? book?.status : 'open')) !== 'closed';
            const selected = key === month;
            return (
              <div
                key={key}
                className={`bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm ${isOpen ? '' : 'opacity-75'}`}
              >
                <div className={`border-b border-outline-variant p-4 flex justify-between items-center ${isOpen ? 'bg-surface-container-low' : 'bg-surface-container-highest'}`}>
                  <div className="flex items-center gap-3">
                    <button type="button" className="font-headline-md text-headline-md text-on-surface" onClick={() => setMonth(key)}>
                      {monthLabel(key).split(' ')[0]}
                    </button>
                    <span className={`px-2 py-1 rounded font-label-md text-label-md flex items-center gap-1 ${isOpen ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                      <MsIcon name={isOpen ? 'lock_open' : 'lock'} className="text-[14px]" />
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {selected && isOpen ? (
                    <button type="button" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm" onClick={() => setClosing(true)}>Close Month</button>
                  ) : selected && !isOpen ? (
                    <button type="button" className="px-4 py-2 border border-outline-variant rounded-lg font-body-sm" onClick={() => setReopen(true)}>Reopen</button>
                  ) : (
                    <button type="button" className="px-4 py-2 border border-outline-variant rounded-lg font-body-sm" onClick={() => setMonth(key)}>View</button>
                  )}
                </div>
                {selected && book ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-label-md text-on-surface-variant uppercase">Balances</h4>
                      <div className="flex justify-between">
                        <span className="font-body-sm text-on-surface-variant">Opening Balance</span>
                        <span className="font-data-mono">{formatCurrency(book.opening?.total || 0, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body-sm text-on-surface-variant">{closed ? 'Closing Balance' : 'Current Balance'}</span>
                        <span className="font-data-mono font-semibold">{formatCurrency((closed ? book.closing?.total : book.closing?.total) || 0, currency)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-label-md text-on-surface-variant uppercase">Period Activity</h4>
                      <div className="flex justify-between">
                        <span className="font-body-sm text-on-surface-variant">Income</span>
                        <span className="font-data-mono text-primary">+{formatCurrency(book.income?.total || 0, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body-sm text-on-surface-variant">Expenses</span>
                        <span className="font-data-mono text-error">-{formatCurrency(book.expenses?.total || 0, currency)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      )}

      <ConfirmationDialog
        open={closing}
        title={`Close ${monthLabel(month)} books?`}
        message="This locks all transactions for the month. You will not be able to add, edit, or delete entries for this period until it is reopened."
        confirmLabel="Close month"
        tone="danger"
        loading={closeState.isLoading}
        onClose={() => setClosing(false)}
        onConfirm={confirmClose}
      />

      <Modal
        open={reopen}
        title={`Reopen ${monthLabel(month)}`}
        onClose={() => setReopen(false)}
        footer={(
          <>
            <button type="button" className="px-4 py-2 border border-outline-variant rounded-lg" onClick={() => setReopen(false)}>Cancel</button>
            <button type="button" className="px-4 py-2 bg-primary text-on-primary rounded-lg inline-flex items-center justify-center gap-2" onClick={confirmReopen} disabled={reopenState.isLoading}>
              {reopenState.isLoading ? <Loader size="sm" /> : null}
              {reopenState.isLoading ? 'Reopening…' : 'Reopen month'}
            </button>
          </>
        )}
      >
        <p className="font-body-sm text-on-surface-variant mb-md">Reopening is written to the audit log.</p>
        <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Correct a misposted expense" />
      </Modal>
    </div>
  );
}
