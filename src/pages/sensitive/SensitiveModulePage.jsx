import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useGetSensitiveModuleQuery, useLockPinMutation } from '../../features/security/securityApi';
import { SENSITIVE_MODULE_COPY } from '../../constants';
import { formatDateTime } from '../../utils/format';

export function SensitiveModulePage({ moduleId: moduleIdProp }) {
  const params = useParams();
  const moduleId = moduleIdProp || params.moduleId;
  const copy = SENSITIVE_MODULE_COPY[moduleId] || { title: 'Protected module', description: 'This area requires a live PIN unlock.' };
  const { data, isLoading, error, refetch } = useGetSensitiveModuleQuery(moduleId, { skip: !moduleId });
  const [lockPin, { isLoading: locking }] = useLockPinMutation();
  const payload = data?.data;

  if (isLoading) {
    return (
      <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
        <LoadingState label="Opening protected module" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="This module stayed locked"
        message={error?.data?.message || 'The server refused access. Unlock your PIN and try again.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="st-page settings-grid">
      <header className="page-hero">
        <p className="page-kicker">PIN unlocked</p>
        <h1 className="st-page-title">{copy.title}</h1>
        <p className="page-lead">{copy.description}</p>
      </header>

      <Alert tone="success" title="Server authorized this request">
        Authenticated user, live PIN unlock, and ownership were all checked before this page received data.
      </Alert>

      <Card>
        <CardHeader
          title="Session"
          subtitle="Unlock cookies are httpOnly. Closing this window does not extend the timer."
          action={
            <Button size="sm" variant="ghost" loading={locking} onClick={() => lockPin()}>
              Lock now
            </Button>
          }
        />
        <div className="profile-badges">
          <Badge tone="accent">{payload?.module}</Badge>
          <Badge tone="success">Owner {payload?.ownerId ? 'matched' : 'unknown'}</Badge>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Unlock expires {formatDateTime(payload?.pinExpiresAt)}.
        </p>
      </Card>

      <EmptyState
        icon="lock"
        title={`${copy.title} is ready`}
        message="Records will appear here when this module is implemented. Until then the lock, timeout, and API checks are already live."
      />
      {moduleId === 'expenses' || moduleId === 'income' || moduleId === 'debts' ? (
        <Link to="/app/money" className="auth-inline-link">Back to Money</Link>
      ) : null}
    </div>
  );
}
