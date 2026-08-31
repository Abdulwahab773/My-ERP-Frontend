import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, CardHeader, Checkbox } from '../ui';
import { useToast } from '../ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import { useUpdateNotificationPrefsMutation } from '../../features/notifications/notificationsApi';

const EMAIL_ROWS = [
  { id: 'goals', label: 'Goal reminders' },
  { id: 'finance', label: 'Expense limit warnings' },
  { id: 'debts', label: 'Debt due reminders' },
  { id: 'reports', label: 'Monthly reports' },
  { id: 'sharing', label: 'Sharing notices' },
  { id: 'product', label: 'Product updates' },
];

const INAPP_ROWS = [
  { id: 'goals', label: 'Goals' },
  { id: 'finance', label: 'Finance' },
  { id: 'debts', label: 'Debts' },
  { id: 'reports', label: 'Reports' },
  { id: 'sharing', label: 'Sharing' },
  { id: 'sync', label: 'Sync failures' },
  { id: 'vault', label: 'Password warnings' },
  { id: 'env', label: 'ENV activity' },
];

export function NotificationPrefs() {
  const user = useSelector(selectUser);
  const { push } = useToast();
  const [save, { isLoading }] = useUpdateNotificationPrefsMutation();
  const [email, setEmail] = useState({});
  const [inApp, setInApp] = useState({});

  useEffect(() => {
    setEmail(user?.notificationPrefs?.email || {});
    setInApp(user?.notificationPrefs?.inApp || {});
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    try {
      await save({ email, inApp: { ...inApp, security: true } }).unwrap();
      push({ tone: 'success', title: 'Notification preferences saved' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save preferences' });
    }
  }

  return (
    <Card>
      <CardHeader
        title="Notifications"
        subtitle="Security emails stay on. They cannot be disabled because they protect the account."
      />
      <form className="prefs-grid" onSubmit={submit}>
        <div>
          <h3>Email</h3>
          <div className="pref-row is-locked">
            <Checkbox checked label="Security alerts (required)" onChange={() => {}} />
          </div>
          {EMAIL_ROWS.map((row) => (
            <div key={row.id} className="pref-row">
              <Checkbox
                label={row.label}
                checked={email[row.id] !== false}
                onChange={(event) => setEmail((current) => ({ ...current, [row.id]: event.target.checked }))}
              />
            </div>
          ))}
        </div>
        <div>
          <h3>In the app</h3>
          <div className="pref-row is-locked">
            <Checkbox checked label="Security alerts (required)" onChange={() => {}} />
          </div>
          {INAPP_ROWS.map((row) => (
            <div key={row.id} className="pref-row">
              <Checkbox
                label={row.label}
                checked={inApp[row.id] !== false}
                onChange={(event) => setInApp((current) => ({ ...current, [row.id]: event.target.checked }))}
              />
            </div>
          ))}
        </div>
        <Alert tone="info">Login, PIN reset, and vault/ENV security notices always send.</Alert>
        <Button type="submit" loading={isLoading}>Save preferences</Button>
      </form>
    </Card>
  );
}
