import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui';
import { SENSITIVE_MODULE_COPY } from '../../constants';

const LINKS = [
  { to: '/app/money/expenses', id: 'expenses' },
  { to: '/app/money/income', id: 'income' },
  { to: '/app/money/debts', id: 'debts' },
];

export function MoneyHubPage() {
  return (
    <div className="settings-grid">
      <header className="page-hero">
        <p className="page-kicker">Protected</p>
        <h1 className="page-title">Money</h1>
        <p className="page-lead">
          Expenses, income, and debt share the Security PIN. Opening any of these routes hits a PIN-gated API.
        </p>
      </header>
      <div className="money-hub-grid">
        {LINKS.map((item) => (
          <Link key={item.id} to={item.to} className="money-hub-card">
            <Card>
              <CardHeader title={SENSITIVE_MODULE_COPY[item.id].title} subtitle={SENSITIVE_MODULE_COPY[item.id].description} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
