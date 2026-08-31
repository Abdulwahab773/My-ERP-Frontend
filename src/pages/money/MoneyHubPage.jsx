import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MsIcon } from '../../components/ui/MsIcon';
import { selectUser } from '../../features/auth/authSlice';
import { useGetFinanceOverviewQuery } from '../../features/finance/financeApi';
import { useGetDebtSummaryQuery } from '../../features/debts/debtsApi';
import { currentMonthKey, formatCurrency } from '../../utils/format';
import { MoneyNav } from './MoneyNav';

const DESTINATIONS = [
  { to: '/app/money/income', icon: 'download', label: 'Income' },
  { to: '/app/money/expenses', icon: 'upload', label: 'Expenses' },
  { to: '/app/money/transactions', icon: 'receipt_long', label: 'Transactions' },
  { to: '/app/money/analytics', icon: 'insights', label: 'Analytics' },
  { to: '/app/money/categories', icon: 'category', label: 'Categories' },
  { to: '/app/money/debts', icon: 'credit_card_off', label: 'Debts', alert: true },
  { to: '/app/money/months', icon: 'book', label: 'Books' },
  { to: '/app/reports', icon: 'summarize', label: 'Reports' },
];

export function MoneyHubPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const month = currentMonthKey();
  const { data, error } = useGetFinanceOverviewQuery(month);
  const { data: debtData } = useGetDebtSummaryQuery();
  const overview = data?.data;
  const debts = debtData?.data;
  const balance = overview?.balance;

  return (
    <div className="p-margin-mobile lg:p-margin-desktop max-w-[1400px] mx-auto">
      <MoneyNav />
      <header className="mb-lg">
        <h1 className="st-page-title">Money Hub</h1>
        <p className="st-page-lead">Cash, bank, income, and spend in one place.</p>
      </header>
      {error ? <p className="text-error mb-md">{error?.data?.message || 'Money could not load'}</p> : null}
      {overview?.warnings?.map((item) => (
        <div key={item.title} className="bg-error-container text-on-error-container p-md rounded-lg mb-lg flex items-start gap-md border border-error/20">
          <MsIcon name="warning" filled className="text-error" />
          <div>
            <h4 className="font-label-md text-label-md font-bold uppercase mb-1">{item.title}</h4>
            <p className="font-body-sm text-body-sm">{item.message}</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="p-lg rounded-xl md:col-span-1 bg-primary text-on-primary shadow-md relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container rounded-full opacity-50" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-xl">
              <span className="font-label-md text-label-md uppercase tracking-wider text-inverse-primary">Total Available</span>
              <MsIcon name="account_balance_wallet" className="text-inverse-primary" />
            </div>
            <h2 className="font-display-lg text-display-lg font-bold mb-xs tracking-tight">{formatCurrency(balance?.total || 0, currency)}</h2>
            <p className="font-body-sm text-body-sm">Cash + bank</p>
          </div>
        </div>
        <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-xs">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Cash in Bank</span>
            <MsIcon name="account_balance" filled className="text-secondary" />
          </div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-on-background mb-1">{formatCurrency(balance?.bank || 0, currency)}</h3>
        </div>
        <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-xs">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Cash in Hand</span>
            <MsIcon name="payments" filled className="text-secondary" />
          </div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-on-background mb-1">{formatCurrency(balance?.cash || 0, currency)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mb-lg">
        <div className="lg:col-span-5 bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col">
          <div className="p-md border-b border-surface-variant">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Monthly Overview</h3>
          </div>
          <div className="p-md flex-1 grid grid-cols-2 gap-y-lg gap-x-md">
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1">Total Income</p>
              <p className="font-data-mono text-data-mono text-primary font-bold">{formatCurrency(overview?.totalIncome || 0, currency)}</p>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1">Expenses</p>
              <p className="font-data-mono text-data-mono text-error font-bold">{formatCurrency(overview?.totalExpenses || 0, currency)}</p>
            </div>
            <div className="col-span-2 h-px bg-surface-variant" />
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1">Receivable</p>
              <p className="font-data-mono text-data-mono">{formatCurrency(debts?.receivable || 0, currency)}</p>
            </div>
            <div>
              <p className="font-body-sm text-on-surface-variant mb-1">Payable</p>
              <p className="font-data-mono text-data-mono">{formatCurrency(debts?.payable || 0, currency)}</p>
            </div>
            <div className="col-span-2 mt-auto pt-md border-t border-surface-variant flex justify-between">
              <p className="font-body-sm text-on-surface-variant">Net Position</p>
              <p className="font-headline-md text-headline-md text-primary font-bold">{formatCurrency(overview?.netIncome || 0, currency)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-sm">
          {DESTINATIONS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-surface p-md rounded-lg border border-outline-variant hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-center text-center group h-28 relative"
            >
              {item.alert && debts?.overdue ? <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" /> : null}
              <MsIcon name={item.icon} filled className="text-[28px] text-secondary group-hover:text-primary mb-sm" />
              <span className="font-label-md text-label-md text-on-background">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center py-md border-t border-outline-variant/30 text-on-surface-variant font-body-sm">
        <div className="flex items-center gap-xs">
          <MsIcon name="cloud_sync" filled className="text-[16px] text-secondary" />
          <span>End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
}
