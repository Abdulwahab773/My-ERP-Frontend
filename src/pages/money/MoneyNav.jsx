import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/app/money', label: 'Overview', end: true },
  { to: '/app/money/income', label: 'Income' },
  { to: '/app/money/expenses', label: 'Expenses' },
  { to: '/app/money/transactions', label: 'Ledger' },
  { to: '/app/money/analytics', label: 'Analytics' },
  { to: '/app/money/categories', label: 'Categories' },
  { to: '/app/money/debts', label: 'Debts' },
  { to: '/app/money/months', label: 'Months' },
];

export function MoneyNav() {
  return (
    <nav className="flex gap-xs w-full overflow-x-auto hide-scrollbar mb-md">
      {LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
