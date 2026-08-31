import { Alert, Badge, Card, CardHeader } from '../../components/ui';
import { useGetSecurityActivitySummaryQuery } from '../../features/security/securityApi';
import { formatDateTime } from '../../utils/format';

function Row({ item }) {
  return (
    <div className="activity-row">
      <div>
        <strong>{item.action || item.type}</strong>
        <p className="muted">{item.ip || 'IP hidden'} · {item.userAgent || 'Unknown client'}</p>
      </div>
      <div className="activity-meta">
        {item.result === 'failure' ? <Badge tone="danger">Failed</Badge> : null}
        <span className="muted">{formatDateTime(item.createdAt)}</span>
      </div>
    </div>
  );
}

export function SecurityActivityPage() {
  const { data, isLoading } = useGetSecurityActivitySummaryQuery();
  const summary = data?.data || {};
  const logins = summary.logins || [];
  const sensitive = summary.sensitive || [];
  const failed = summary.failed || [];
  const suspicious = summary.suspicious || [];

  return (
    <div className="st-page settings-grid">
      <header className="page-hero">
        <p className="page-kicker">Protection</p>
        <h1 className="st-page-title">Security activity</h1>
        <p className="page-lead">Append-only audit of sign-ins, PIN events, vault access, and sharing. Plaintext secrets are never stored.</p>
      </header>

      {suspicious.map((item) => (
        <Alert key={item.title} tone={item.tone === 'danger' ? 'danger' : 'warning'} title={item.title}>
          {item.message}
        </Alert>
      ))}

      <div className="profile-grid">
        <Card>
          <CardHeader title="Recent logins" subtitle="Successful and failed sign-in events for this account." />
          <div className="activity-list">
            {logins.map((item) => <Row key={item.id || item._id} item={item} />)}
            {!logins.length && !isLoading ? <p className="muted">No login events yet.</p> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="Failed attempts" subtitle="Authentication and PIN failures." />
          <div className="activity-list">
            {failed.map((item) => <Row key={item.id} item={item} />)}
            {!failed.length ? <p className="muted">No failed attempts recorded.</p> : null}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Sensitive actions" subtitle="Password reveals, ENV exports, sharing, and month-book changes." />
        <div className="activity-list">
          {sensitive.map((item) => <Row key={item.id} item={item} />)}
          {!sensitive.length ? <p className="muted">No sensitive actions yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
