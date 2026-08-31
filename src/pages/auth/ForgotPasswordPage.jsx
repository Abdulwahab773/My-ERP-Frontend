import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { Loader } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useForgotPasswordMutation } from '../../features/auth/authApi';

export function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err) {
      setError(err?.data?.message || 'Unable to send reset instructions');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-md lg:p-margin-desktop">
      <main className="w-full max-w-[480px] bg-surface border border-outline-variant rounded-xl shadow-stitch relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary" />
        <div className="p-xl flex-1 flex flex-col">
          <header className="text-center mb-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high mb-md border border-outline-variant">
              <MsIcon name="key" className="text-primary text-[24px]" />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Recover Vault</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Enter your email. If a workspace exists, we will send a reset link.</p>
          </header>

          {sent ? (
            <div className="bg-secondary-container border border-outline-variant rounded-lg p-md mb-lg">
              <p className="font-body-sm text-body-sm text-on-secondary-container">If an account exists for that email, password reset instructions are on the way.</p>
            </div>
          ) : (
            <form className="flex flex-col gap-md" onSubmit={onSubmit}>
              <AuthError>{error}</AuthError>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Enterprise Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="st-input"
                  placeholder="user@company.com"
                />
              </div>
              <button className="st-btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? <Loader size="sm" /> : null}
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
        <div className="bg-surface-container-low border-t border-outline-variant p-md text-center">
          <Link to="/login" className="font-label-md text-label-md text-primary">Back to sign in</Link>
        </div>
      </main>
    </div>
  );
}
