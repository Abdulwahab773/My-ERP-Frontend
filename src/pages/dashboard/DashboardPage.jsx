import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, EmptyState } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { selectUser } from '../../features/auth/authSlice';
import { useResendVerificationMutation } from '../../features/auth/authApi';
import { useGetDashboardQuery } from '../../features/dashboard/dashboardApi';
import {
  currentMonthKey,
  formatCurrency,
  formatDate,
  formatPercent,
  monthLabel,
} from '../../utils/format';
import { MonthSelector } from './MonthSelector';
import { QuickActions } from './QuickActions';
import { DashboardSkeleton } from './DashboardSkeleton';

const ACTIVITY_ICONS = {
  income: 'work',
  expense: 'shopping_cart',
  Food: 'restaurant',
  Dining: 'restaurant',
  Bills: 'bolt',
  Utilities: 'bolt',
  Housing: 'home',
  Transport: 'directions_car',
};

function activityIcon(item) {
  return ACTIVITY_ICONS[item.category] || ACTIVITY_ICONS[item.type] || 'receipt_long';
}

export function DashboardPage() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const currency = user?.currency || 'USD';
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const [month, setMonth] = useState(currentMonthKey);
  const [privacy, setPrivacy] = useState(false);
  const { data, isLoading, error } = useGetDashboardQuery(month);
  const [resendVerification, { isLoading: sendingVerify }] = useResendVerificationMutation();
  const dash = data?.data;

  const activity = useMemo(() => {
    const recent = dash?.recent || {};
    const rows = [
      ...(recent.income || []).map((item) => ({ ...item, kind: 'income' })),
      ...(recent.expenses || []).map((item) => ({ ...item, kind: 'expense' })),
    ]
      .sort((a, b) => new Date(b.occurredAt || b.createdAt || 0) - new Date(a.occurredAt || a.createdAt || 0))
      .slice(0, 8);
    return rows;
  }, [dash]);

  const spend = dash?.analytics?.categorySpending || [];
  const spendTotal = spend.reduce((sum, item) => sum + (item.value || item.amount || 0), 0) || 1;
  const pieStops = spend.slice(0, 4).reduce((acc, item, index) => {
    const colors = ['var(--st-primary)', 'var(--st-secondary-container)', 'var(--st-tertiary-container)', 'var(--st-surface-variant)'];
    const start = acc.at(-1)?.end || 0;
    const pct = ((item.value || item.amount || 0) / spendTotal) * 100;
    acc.push({ ...item, color: colors[index], start, end: start + pct });
    return acc;
  }, []);
  const pieCss = pieStops.length
    ? `conic-gradient(${pieStops.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(', ')})`
    : 'conic-gradient(var(--st-surface-variant) 0% 100%)';

  const trend = dash?.analytics?.monthlyTrend || [];
  const maxTrend = Math.max(1, ...trend.map((item) => (item.income || 0) + (item.expense || 0)));

  if (!user || (isLoading && !dash)) {
    return <DashboardSkeleton />;
  }

  const locked = Boolean(dash?.financeLocked);
  const summary = dash?.summary;
  const incomeGoal = dash?.goals?.income;
  const expenseGoal = dash?.goals?.expenseLimit;
  const netChange = summary?.cashInHandChangePct || 0;

  return (
    <div className="max-w-7xl mx-auto p-margin-mobile lg:p-margin-desktop space-y-xl">
      {!user.emailVerified ? (
        <div className="bg-error-container text-on-error-container px-md py-sm flex items-center justify-between border border-error/20 rounded-lg">
          <div className="flex items-center gap-sm">
            <MsIcon name="warning" />
            <span className="font-body-sm text-body-sm">Please verify your email address to unlock full Vault capabilities.</span>
          </div>
          <button type="button" className="font-label-md text-label-md uppercase" onClick={() => resendVerification()} disabled={sendingVerify}>
            Resend
          </button>
        </div>
      ) : null}

      {error ? <Alert tone="danger" title={error?.data?.message || 'Dashboard could not load'} /> : null}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-background">Hello {firstName}.</h1>
          <div className="flex items-center gap-xs mt-1 text-secondary">
            <MsIcon name="sync" className="text-sm sync-pulse" />
            <span className="font-label-md text-label-md uppercase tracking-wider">Synced just now</span>
          </div>
        </div>
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
        {incomeGoal?.achieved ? (
          <div className="bg-surface border border-[#10b981]/30 rounded-lg p-sm flex items-start gap-sm">
            <MsIcon name="check_circle" filled className="text-[#10b981]" />
            <div>
              <div className="font-label-md text-label-md text-[#10b981] uppercase mb-1">Goal Reached</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{incomeGoal.message || 'Income target met this month.'}</div>
            </div>
          </div>
        ) : null}
        {expenseGoal?.exceeded ? (
          <div className="bg-surface border border-error/30 rounded-lg p-sm flex items-start gap-sm">
            <MsIcon name="error" filled className="text-error" />
            <div>
              <div className="font-label-md text-label-md text-error uppercase mb-1">Expense Alert</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Spending is {formatCurrency(expenseGoal.current, currency)} against a {formatCurrency(expenseGoal.target, currency)} limit.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <section className="relative">
        <div className="flex items-center justify-between mb-sm border-b border-outline-variant pb-xs">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Financial Overview</h2>
          <button type="button" className="text-secondary hover:text-primary transition-colors flex items-center gap-xs" onClick={() => setPrivacy((current) => !current)}>
            <MsIcon name={privacy ? 'lock' : 'lock_open'} className="text-sm" />
            <span className="font-label-md text-label-md">Toggle Privacy</span>
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter relative">
          <div className="bento-card">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">Net Balance</div>
            <div className="font-data-mono text-data-mono text-2xl lg:text-3xl text-on-background mb-sm">{locked ? '••••' : formatCurrency(summary?.netBalance || 0, currency)}</div>
            <div className="flex items-center gap-xs text-[#10b981] font-label-md text-label-md">
              <MsIcon name="trending_up" className="text-sm" />
              <span>{formatPercent(netChange)}</span>
            </div>
          </div>
          <div className="bento-card">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">Total Income</div>
            <div className="font-data-mono text-data-mono text-2xl lg:text-3xl text-on-background mb-sm">{locked ? '••••' : formatCurrency(summary?.monthlyIncome || 0, currency)}</div>
            <div className="font-label-md text-label-md text-secondary">{dash?.label || monthLabel(month)}</div>
          </div>
          <div className="bento-card">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">Total Expenses</div>
            <div className="font-data-mono text-data-mono text-2xl lg:text-3xl text-on-background mb-sm">{locked ? '••••' : formatCurrency(summary?.monthlyExpenses || 0, currency)}</div>
          </div>
          <div className="bento-card">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">Lent / Borrowed</div>
            <div className="font-data-mono text-data-mono text-2xl lg:text-3xl text-primary mb-sm">
              {locked ? '••••' : formatCurrency((summary?.moneyLent || 0) - (summary?.moneyBorrowed || 0), currency)}
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">Pending Settlements</div>
          </div>
          {privacy || locked ? (
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-surface/70 rounded-xl border border-outline-variant flex flex-col items-center justify-center">
              <MsIcon name="lock" className="text-4xl text-on-surface-variant mb-xs" />
              <span className="font-headline-md text-headline-md text-on-surface">Data Hidden</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {locked ? 'Unlock money to reveal' : 'Tap lock icon to reveal'}
              </span>
              {locked ? (
                <button type="button" className="st-btn-ghost mt-sm" onClick={() => navigate('/app/money')}>Unlock</button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-xl">
          <section>
            <div className="flex items-center justify-between mb-sm border-b border-outline-variant pb-xs">
              <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Quick Actions</h2>
            </div>
            <QuickActions month={month} financeLocked={locked} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bento-card flex flex-col">
              <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Spend Categories</div>
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="w-40 h-40 rounded-full relative" style={{ background: pieCss }}>
                  <div className="absolute inset-4 bg-surface rounded-full flex items-center justify-center flex-col">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase">Top</span>
                    <span className="font-data-mono text-data-mono text-primary font-bold">{spend[0]?.label || spend[0]?.category || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                {pieStops.map((item) => (
                  <div key={item.label || item.category} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    {item.label || item.category}
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card flex flex-col">
              <div className="font-label-md text-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">8-Month Trend</div>
              <div className="flex-1 flex items-end justify-between gap-1 pt-4 h-40">
                {(trend.length ? trend : Array.from({ length: 8 }, () => ({ expense: 0 }))).slice(-8).map((item, index, rows) => {
                  const height = Math.max(8, ((item.expense || item.income || 0) / maxTrend) * 100);
                  const last = index === rows.length - 1;
                  return (
                    <div key={item.label || index} className={`w-full rounded-t-sm ${last ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${height}%` }} />
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <section className="bento-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-sm border-b border-outline-variant pb-xs">
              <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Recent Activity</h2>
              <Link to="/app/money/transactions" className="text-primary hover:underline font-label-md text-label-md text-xs">View All</Link>
            </div>
            <div className="flex-1 space-y-0">
              {!activity.length ? (
                <EmptyState icon="empty" title="No activity yet" message="Income and expenses will appear here." />
              ) : activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-sm border-b border-surface-variant">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <MsIcon name={activityIcon(item)} className="text-[18px]" />
                    </div>
                    <div>
                      <div className="font-body-sm text-body-sm text-on-surface font-medium">{item.title}</div>
                      <div className="font-label-md text-label-md text-on-surface-variant text-[10px]">
                        {item.category || item.kind} · {formatDate(item.occurredAt || item.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-data-mono text-data-mono ${item.kind === 'income' ? 'text-[#10b981]' : 'text-on-background'}`}>
                    {item.kind === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
