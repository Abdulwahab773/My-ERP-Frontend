import { useState } from 'react';
import { Alert, CategoryBarChart, DualTrendChart, AreaTrendChart } from '../../components/ui';
import { useGetFinanceAnalyticsQuery, useGetFinanceOverviewQuery } from '../../features/finance/financeApi';
import { currentMonthKey, monthLabel } from '../../utils/format';
import { MonthPill } from '../dashboard/MonthSelector';
import { MoneyNav } from './MoneyNav';

export function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data } = useGetFinanceAnalyticsQuery(month);
  const { data: overviewData } = useGetFinanceOverviewQuery(month);
  const analytics = data?.data;
  const warnings = [...(overviewData?.data?.warnings || []), ...(analytics?.warnings || [])];

  return (
    <div className="st-page">
      <MoneyNav />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="st-page-title">Analytics</h1>
          <p className="st-page-lead">Spending mix, income sources, and cash flow for {monthLabel(month)}.</p>
        </div>
        <MonthPill value={month} onChange={setMonth} />
      </header>

      {warnings.map((item) => (
        <Alert key={item.title} tone={item.tone} title={item.title}>{item.message}</Alert>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Income vs expense</h3>
          <DualTrendChart data={analytics?.daily || []} />
        </section>
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Cash flow</h3>
          <AreaTrendChart data={analytics?.cashFlow || []} fillId="cashFlow" />
        </section>
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Spending by category</h3>
          <CategoryBarChart data={analytics?.spendingByCategory || []} />
        </section>
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Income by category</h3>
          <CategoryBarChart data={analytics?.incomeByCategory || []} />
        </section>
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">8-month trend</h3>
          <DualTrendChart data={analytics?.monthlyTrend || []} />
        </section>
        <section className="bento-card">
          <h3 className="font-label-md text-on-surface-variant uppercase mb-md border-b border-outline-variant pb-xs">Top categories</h3>
          <ul className="space-y-sm">
            {(analytics?.topExpenses || []).map((item) => (
              <li key={item.label} className="flex justify-between font-body-sm">
                <strong>{item.label}</strong>
                <span className="font-data-mono">{item.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
