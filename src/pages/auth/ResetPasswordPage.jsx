import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { PasswordPolicy } from '../../components/auth/PasswordPolicy';
import { Loader } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { useResetPasswordMutation } from '../../features/auth/authApi';
import { passwordMeetsPolicy } from '../../utils/passwordStrength';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const navigate = useNavigate();
  const { push } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This reset link is missing a token.');
      return;
    }
    if (!passwordMeetsPolicy(form.password)) {
      setError('Password must include uppercase, lowercase, and a number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, ...form }).unwrap();
      push({ tone: 'success', title: 'Password updated', message: 'Sign in with your new password.' });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.data?.message || 'Unable to reset password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-md lg:p-margin-desktop">
      <main className="w-full max-w-[480px] bg-surface border border-outline-variant rounded-xl shadow-stitch relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary" />
        <div className="p-xl">
          <header className="text-center mb-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high mb-md border border-outline-variant">
              <MsIcon name="lock_reset" className="text-primary text-[24px]" />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">New password</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">This link works once. After you save, other sessions are signed out.</p>
          </header>
          <form className="flex flex-col gap-md" onSubmit={onSubmit}>
            <AuthError>{error}</AuthError>
            {!token ? <AuthError title="Missing token">Open the link from your email to continue.</AuthError> : null}
            <div className="flex flex-col gap-xs">
              <label className="st-label" htmlFor="password">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={update} className="st-input" />
              <PasswordPolicy password={form.password} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="st-label" htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={update} className="st-input" />
            </div>
            <button className="st-btn-primary" type="submit" disabled={isLoading || !token}>
              {isLoading ? <Loader size="sm" /> : null}
              {isLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
        <div className="bg-surface-container-low border-t border-outline-variant p-md text-center">
          <Link to="/login" className="font-label-md text-label-md text-primary">Back to sign in</Link>
        </div>
      </main>
    </div>
  );
}
