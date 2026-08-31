import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmationDialog,
  Input,
  ListSkeleton,
  PasswordInput,
} from '../../components/ui';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { useToast } from '../../components/ui/Toast';
import {
  useChangePasswordMutation,
  useGetSessionsQuery,
  useLogoutAllMutation,
  useResendVerificationMutation,
  useRevokeSessionMutation,
} from '../../features/auth/authApi';
import {
  useChangePinMutation,
  useGetActivityQuery,
  useGetSecurityOverviewQuery,
  useLockPinMutation,
} from '../../features/security/securityApi';
import { formatDate, formatDateTime } from '../../utils/format';
import { passwordMeetsPolicy } from '../../utils/passwordStrength';

const ACTIVITY_LABELS = {
  login_success: 'Signed in',
  login_failure: 'Failed sign-in',
  logout: 'Signed out',
  pin_create: 'Security PIN created',
  pin_unlock: 'PIN unlocked',
  pin_lock: 'PIN locked',
  pin_fail: 'Incorrect PIN',
  pin_change: 'PIN changed',
  pin_reset: 'PIN reset',
  otp_sent: 'PIN reset code sent',
  otp_fail: 'Incorrect PIN reset code',
};

export function SecurityCenterPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: overviewData, isLoading } = useGetSecurityOverviewQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: activityData } = useGetActivityQuery();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();
  const [changePin, { isLoading: savingPin }] = useChangePinMutation();
  const [lockPin, { isLoading: locking }] = useLockPinMutation();
  const [logoutAll, { isLoading: endingSessions }] = useLogoutAllMutation();
  const [revokeSession, revokeState] = useRevokeSessionMutation();
  const [resendVerification, { isLoading: sendingVerify }] = useResendVerificationMutation();

  const overview = overviewData?.data;
  const user = overview?.profile;
  const pin = overview?.pin;
  const sessions = sessionData?.data?.sessions || overview?.sessions || [];
  const activity = activityData?.data?.activity || overview?.activity || [];

  const [passwords, setPasswords] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [pins, setPins] = useState({ currentPin: '', pin: '', confirmPin: '' });
  const [passwordError, setPasswordError] = useState('');
  const [pinError, setPinError] = useState('');
  const [confirm, setConfirm] = useState('');
  const [revoking, setRevoking] = useState(null);

  function updatePasswordField(event) {
    setPasswords((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updatePinField(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setPins((current) => ({ ...current, [event.target.name]: digits }));
  }

  async function savePassword(event) {
    event.preventDefault();
    setPasswordError('');
    if (!passwordMeetsPolicy(passwords.password)) {
      setPasswordError('Password must include uppercase, lowercase, and a number.');
      return;
    }
    if (passwords.password !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      await changePassword(passwords).unwrap();
      setPasswords({ currentPassword: '', password: '', confirmPassword: '' });
      push({ tone: 'success', title: 'Password updated', message: 'Other sessions were signed out.' });
    } catch (err) {
      setPasswordError(err?.data?.message || 'Unable to update password');
    }
  }

  async function savePin(event) {
    event.preventDefault();
    setPinError('');
    if (pins.pin !== pins.confirmPin) {
      setPinError('New PINs do not match.');
      return;
    }
    try {
      await changePin({ currentPin: pins.currentPin, pin: pins.pin, confirmPin: pins.confirmPin }).unwrap();
      setPins({ currentPin: '', pin: '', confirmPin: '' });
      push({ tone: 'success', title: 'PIN updated', message: 'We emailed a confirmation to your address.' });
    } catch (err) {
      setPinError(err?.data?.message || 'Unable to update PIN');
    }
  }

  async function signOutEverywhere() {
    try {
      await logoutAll({ everywhere: true }).unwrap();
      navigate('/login');
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to sign out sessions' });
    } finally {
      setConfirm('');
    }
  }

  return (
    <div className="st-page settings-grid">
      <header className="page-hero">
        <p className="page-kicker">Protection</p>
        <h1 className="st-page-title">Security</h1>
        <p className="page-lead">
          Sessions, PIN status, and sign-in history for this account.
        </p>
        <Button size="sm" variant="secondary" onClick={() => navigate('/app/security/activity')}>
          Open security activity
        </Button>
      </header>

      {isLoading && !overview ? <ListSkeleton variant="tile" count={6} /> : (
      <div className="security-status-grid">
        <Card>
          <p className="muted">Last login</p>
          <strong>{formatDateTime(user?.lastLoginAt)}</strong>
          <p className="muted">{user?.lastLoginIp || 'IP hidden'}</p>
        </Card>
        <Card>
          <p className="muted">Security PIN</p>
          <strong>{user?.pinSet ? (pin?.unlocked ? 'Unlocked' : 'Locked') : 'Not set'}</strong>
          <p className="muted">{user?.pinChangedAt ? `Changed ${formatDate(user.pinChangedAt)}` : 'Create a PIN on first sign-in'}</p>
        </Card>
        <Card>
          <p className="muted">Email</p>
          <strong>{user?.emailVerified ? 'Verified' : 'Unverified'}</strong>
          <p className="muted">{user?.email}</p>
        </Card>
        <Card>
          <p className="muted">Password</p>
          <strong>{user?.hasPassword ? 'Set' : 'Google only'}</strong>
          <p className="muted">{user?.passwordChangedAt ? `Changed ${formatDate(user.passwordChangedAt)}` : 'No change recorded'}</p>
        </Card>
        <Card>
          <p className="muted">Google</p>
          <strong>{user?.googleConnected ? 'Connected' : 'Not connected'}</strong>
          <p className="muted">{(user?.authProviders || []).join(', ') || 'local'}</p>
        </Card>
        <Card>
          <p className="muted">Failed logins (24h)</p>
          <strong>{overview?.failedLogins24h ?? 0}</strong>
          <p className="muted">Counted for this account only</p>
        </Card>
      </div>
      )}

      {!user?.emailVerified ? (
        <Alert tone="warning" title="Verify email to recover a forgotten PIN">
          PIN reset codes are only sent to a verified address.
          <div style={{ marginTop: 10 }}>
            <Button size="sm" variant="secondary" loading={sendingVerify} onClick={() => resendVerification()}>
              Resend verification
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title="PIN status"
          subtitle="Unlock lasts 10 minutes, then sensitive APIs refuse access until you enter the PIN again."
          action={
            pin?.unlocked ? (
              <Button size="sm" variant="ghost" loading={locking} onClick={() => lockPin()}>
                Lock now
              </Button>
            ) : null
          }
        />
        <div className="profile-badges">
          <Badge tone={user?.pinSet ? 'success' : 'gold'}>{user?.pinSet ? 'PIN configured' : 'PIN missing'}</Badge>
          <Badge tone={pin?.unlocked ? 'accent' : 'neutral'}>{pin?.unlocked ? 'Modules unlocked' : 'Modules locked'}</Badge>
          {pin?.lockedUntil ? <Badge tone="gold">Temporary lockout</Badge> : null}
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          {pin?.expiresAt ? `Current unlock expires ${formatDateTime(pin.expiresAt)}.` : 'No active unlock on this device.'}
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Active sessions"
          subtitle="Each row is a refresh session owned by you. Revoking a foreign id does nothing."
          action={
            <div className="security-actions">
              <Button size="sm" variant="ghost" loading={endingSessions} onClick={() => setConfirm('others')}>
                Sign out others
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirm('everywhere')}>
                Sign out everywhere
              </Button>
            </div>
          }
        />
        <div className="session-list">
          {sessions.map((session) => (
            <div key={session.id} className="session-row">
              <div>
                <strong>{session.current ? 'This device' : 'Another device'}</strong>
                <p className="muted">{session.userAgent || 'Unknown browser'}</p>
                <p className="muted">
                  {session.ip || 'IP hidden'} · {session.remember ? 'Remembered' : 'Short session'} · {formatDateTime(session.createdAt)}
                </p>
              </div>
              {session.current ? (
                <Badge tone="accent">Current</Badge>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setRevoking(session)}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
          {sessions.length === 0 && !isLoading ? <p className="muted">No active sessions.</p> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent activity" subtitle="Successful logins, failures, and PIN events for this account." />
        <div className="activity-list">
          {activity.map((item) => (
            <div key={item.id || item._id} className="activity-row">
              <div>
                <strong>{ACTIVITY_LABELS[item.type] || item.type}</strong>
                <p className="muted">{item.ip || 'IP hidden'} · {item.userAgent || 'Unknown client'}</p>
              </div>
              <span className="muted">{formatDateTime(item.createdAt)}</span>
            </div>
          ))}
          {activity.length === 0 ? <p className="muted">No activity recorded yet.</p> : null}
        </div>
      </Card>

      <div className="profile-grid">
        <Card>
          <CardHeader
            title={user?.hasPassword ? 'Change password' : 'Set a password'}
            subtitle="Argon2id on the server. The hash never appears in API responses."
          />
          <form className="auth-form" onSubmit={savePassword}>
            {passwordError ? <Alert tone="danger">{passwordError}</Alert> : null}
            {user?.hasPassword ? (
              <PasswordInput
                label="Current password"
                name="currentPassword"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={updatePasswordField}
                required
                placeholder="••••••••"
              />
            ) : (
              <Alert tone="info">This account can add a password for email sign-in.</Alert>
            )}
            <PasswordInput label="New password" name="password" autoComplete="new-password" value={passwords.password} onChange={updatePasswordField} required placeholder="••••••••" />
            <PasswordStrength password={passwords.password} />
            <PasswordInput label="Confirm password" name="confirmPassword" autoComplete="new-password" value={passwords.confirmPassword} onChange={updatePasswordField} required placeholder="••••••••" />
            <Button type="submit" loading={savingPassword}>Update password</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Change PIN" subtitle="Enter the current PIN, then a new 4-digit code. Predictable PINs are rejected." />
          <form className="auth-form" onSubmit={savePin}>
            {pinError ? <Alert tone="danger">{pinError}</Alert> : null}
            <Input label="Current PIN" name="currentPin" inputMode="numeric" autoComplete="off" value={pins.currentPin} onChange={updatePinField} required placeholder="0000" />
            <Input label="New PIN" name="pin" inputMode="numeric" autoComplete="off" value={pins.pin} onChange={updatePinField} required placeholder="0000" />
            <Input label="Confirm new PIN" name="confirmPin" inputMode="numeric" autoComplete="off" value={pins.confirmPin} onChange={updatePinField} required placeholder="0000" />
            <Button type="submit" loading={savingPin} disabled={!user?.pinSet}>Update PIN</Button>
          </form>
        </Card>
      </div>

      <ConfirmationDialog
        open={confirm === 'everywhere'}
        title="Sign out every session?"
        message="This device and every other signed-in browser will be signed out. Sensitive modules lock immediately."
        confirmLabel="Sign out everywhere"
        loading={endingSessions}
        onConfirm={signOutEverywhere}
        onClose={() => setConfirm('')}
      />
      <ConfirmationDialog
        open={confirm === 'others'}
        title="Sign out other devices?"
        message="This device stays signed in. Every other refresh session is revoked."
        confirmLabel="Sign out others"
        loading={endingSessions}
        onClose={() => setConfirm('')}
        onConfirm={async () => {
          try {
            await logoutAll().unwrap();
            setConfirm('');
            push({ tone: 'success', title: 'Other sessions signed out' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to sign out sessions' });
          }
        }}
      />
      <ConfirmationDialog
        open={Boolean(revoking)}
        title="Revoke this session?"
        message="That browser will have to sign in again."
        confirmLabel="Revoke"
        loading={revokeState.isLoading}
        onClose={() => setRevoking(null)}
        onConfirm={async () => {
          try {
            await revokeSession(revoking.id).unwrap();
            setRevoking(null);
            push({ tone: 'success', title: 'Session revoked' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to revoke session' });
          }
        }}
      />
    </div>
  );
}
