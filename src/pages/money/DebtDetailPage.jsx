import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, ConfirmationDialog, EmptyState, ListSkeleton, Loader, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { ACCOUNTS } from '../../constants';
import { selectUser } from '../../features/auth/authSlice';
import { useDeleteDebtRecordMutation, useGetDebtQuery, useRepayDebtMutation } from '../../features/debts/debtsApi';
import { formatCurrency, formatDate, todayIso } from '../../utils/format';
import { MoneyNav } from './MoneyNav';
import { makeOperationId } from '../../pwa/ids';

export function DebtDetailPage() {
  const { debtId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const { data, error, isLoading } = useGetDebtQuery(debtId);
  const [repayDebt, repayState] = useRepayDebtMutation();
  const [deleteDebt, deleteState] = useDeleteDebtRecordMutation();
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState({ amount: '', account: 'cash', date: todayIso(), note: '' });
  const repayKey = useRef(makeOperationId());
  const item = data?.data?.item;

  async function repay(event) {
    event.preventDefault();
    try {
      await repayDebt({
        debtId,
        amount: Number(form.amount),
        account: form.account,
        date: form.date,
        note: form.note,
        idempotencyKey: repayKey.current,
      }).unwrap();
      repayKey.current = makeOperationId();
      setForm({ amount: '', account: form.account, date: todayIso(), note: '' });
      push({ tone: 'success', title: 'Repayment recorded' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to record repayment' });
    }
  }

  if (isLoading) {
    return (
      <div className="st-page">
        <MoneyNav />
        <ListSkeleton variant="card" count={3} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="st-page">
        <MoneyNav />
        <EmptyState title="Debt not found" actionLabel="Back" onAction={() => navigate('/app/money/debts')} />
      </div>
    );
  }

  const incoming = item.type === 'lent';
  const paidPct = item.principal ? Math.min(100, ((item.principal - item.outstanding) / item.principal) * 100) : 0;

  return (
    <div className="st-page">
      <MoneyNav />
      <Link to="/app/money/debts" className="font-label-md text-label-md text-primary hover:underline inline-flex items-center gap-xs mb-md">
        <MsIcon name="arrow_back" className="text-[16px]" />
        All debts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 space-y-md">
          <div className="st-panel p-lg">
            <div className="flex items-start justify-between gap-md border-b border-outline-variant pb-sm mb-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  {incoming ? 'Money lent' : 'Money borrowed'}
                </p>
                <h1 className="font-headline-md text-headline-md text-[28px]">{item.person}</h1>
                <p className="font-body-sm text-on-surface-variant mt-1">{item.note || 'No notes'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded font-label-md text-[10px] uppercase ${
                item.status === 'overdue'
                  ? 'bg-error-container text-on-error-container'
                  : item.status === 'paid'
                    ? 'bg-surface-variant text-on-surface-variant'
                    : 'bg-secondary-container text-on-secondary-container'
              }`}
              >
                {item.status}
              </span>
            </div>
            <div className="flex justify-between font-data-mono text-[13px] mb-xs">
              <span>{formatCurrency(item.outstanding, currency)} <span className="text-on-surface-variant">outstanding</span></span>
              <span className="text-on-surface-variant">of {formatCurrency(item.principal, currency)}</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-lg">
              <div className={`h-full rounded-full ${incoming ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${paidPct}%` }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div>
                <p className="font-label-md text-on-surface-variant uppercase">Original</p>
                <p className="font-data-mono text-lg">{formatCurrency(item.principal, currency)}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant uppercase">Paid</p>
                <p className="font-data-mono text-lg">{formatCurrency(item.paid, currency)}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant uppercase">Outstanding</p>
                <p className="font-data-mono text-lg text-primary">{formatCurrency(item.outstanding, currency)}</p>
              </div>
              <div>
                <p className="font-label-md text-on-surface-variant uppercase">Due</p>
                <p className="font-data-mono text-lg">{item.dueDate ? formatDate(item.dueDate) : '—'}</p>
              </div>
            </div>
          </div>

          <div className="st-panel p-md bg-surface-bright">
            <h4 className="font-label-md text-label-md text-on-background mb-md flex items-center gap-xs">
              <MsIcon name="history" className="text-[16px]" />
              Transaction History
            </h4>
            <div className="relative border-l-2 border-surface-container-high ml-2 pl-4 flex flex-col gap-md">
              {(item.repayments || []).map((row) => (
                <div key={row.id || row.occurredAt} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant border-2 border-surface-bright" />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-body-sm font-medium">Repayment Made</div>
                      <div className="font-body-sm text-on-surface-variant text-[12px]">{row.account === 'bank' ? 'Bank' : 'Cash'}{row.note ? ` · ${row.note}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-data-mono">{formatCurrency(row.amount, currency)}</div>
                      <div className="font-body-sm text-on-surface-variant text-[12px]">{formatDate(row.occurredAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-bright" />
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-body-sm font-medium">{incoming ? 'Principal Lent' : 'Principal Borrowed'}</div>
                    <div className="font-body-sm text-on-surface-variant text-[12px]">Initial Agreement</div>
                  </div>
                  <div className="text-right">
                    <div className="font-data-mono">{formatCurrency(item.principal, currency)}</div>
                    <div className="font-body-sm text-on-surface-variant text-[12px]">{item.occurredAt ? formatDate(item.occurredAt) : '—'}</div>
                  </div>
                </div>
              </div>
              {!item.repayments?.length ? (
                <p className="font-body-sm text-on-surface-variant">No repayments yet.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 st-panel sticky top-24">
          <div className="p-md border-b border-outline-variant bg-surface-bright rounded-t-xl">
            <div className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Debt Details</div>
            <h3 className="font-headline-md text-[20px]">{item.person}</h3>
          </div>
          {item.status !== 'paid' ? (
            <div className="p-md border-b border-outline-variant">
              <h4 className="font-label-md text-on-background mb-sm">Record Repayment</h4>
              <p className="font-body-sm text-on-surface-variant mb-sm">
                {incoming ? 'Money coming back increases the selected balance.' : 'Paying this down decreases the selected balance.'}
              </p>
              <form className="flex flex-col gap-sm" onSubmit={repay}>
                <label className="font-label-md text-on-surface-variant">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono">$</span>
                  <input
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-8 pr-3 py-2 font-data-mono"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </div>
                <label className="font-label-md text-on-surface-variant">From Account</label>
                <Select
                  value={form.account}
                  onChange={(event) => setForm((current) => ({ ...current, account: event.target.value }))}
                  aria-label="From account"
                >
                  {ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.id}>{account.label}</option>
                  ))}
                </Select>
                <label className="font-label-md text-on-surface-variant">Date</label>
                <input
                  className="st-input"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                />
                <label className="font-label-md text-on-surface-variant">Note</label>
                <input
                  className="st-input"
                  value={form.note}
                  placeholder="Optional note"
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                />
                <button
                  className="mt-2 bg-secondary text-on-secondary font-label-md px-md py-2 rounded-lg w-full inline-flex items-center justify-center gap-2"
                  type="submit"
                  disabled={repayState.isLoading}
                >
                  {repayState.isLoading ? <Loader size="sm" /> : null}
                  {repayState.isLoading ? 'Processing…' : incoming ? 'Receive payment' : 'Process Payment'}
                </button>
              </form>
            </div>
          ) : null}
          <div className="p-md">
            <Button variant="ghost" onClick={() => setConfirm(true)}>Delete debt</Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirm}
        title="Delete this debt?"
        message="Repayments and related ledger rows will be reversed."
        loading={deleteState.isLoading}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          try {
            await deleteDebt(debtId).unwrap();
            push({ tone: 'success', title: 'Debt deleted' });
            navigate('/app/money/debts');
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete' });
          }
        }}
      />
    </div>
  );
}
