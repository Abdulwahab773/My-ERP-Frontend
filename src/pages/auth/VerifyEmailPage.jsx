import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { MsIcon } from '../../components/ui/MsIcon';
import { useVerifyEmailMutation } from '../../features/auth/authApi';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState(token ? 'pending' : 'missing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    verifyEmail({ token })
      .unwrap()
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(err?.data?.message || 'This verification link is invalid or has expired.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center p-md lg:p-margin-desktop">
      <main className="w-full max-w-[480px] bg-surface border border-outline-variant rounded-xl shadow-stitch relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary" />
        <div className="p-xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high mb-md border border-outline-variant">
            <MsIcon name="mark_email_read" className="text-primary text-[24px]" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-xs">Confirm your address</h1>
          <div className="flex flex-col gap-md mt-lg text-left">
            {status === 'pending' || isLoading ? <p className="font-body-md text-body-md text-on-surface-variant">Verifying your email…</p> : null}
            {status === 'success' ? (
              <div className="bg-secondary-container rounded-lg p-md">
                <p className="font-body-sm text-body-sm text-on-secondary-container">Your workspace email is confirmed. You can return to the dashboard.</p>
              </div>
            ) : null}
            {status === 'error' ? <AuthError>{message}</AuthError> : null}
            {status === 'missing' ? <AuthError title="Missing link">Open the verification link from your inbox to finish this step.</AuthError> : null}
            <div className="flex gap-md">
              <Link to="/login" className="st-btn-ghost">Sign in</Link>
              <Link to="/app" className="st-btn-primary">Continue</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
