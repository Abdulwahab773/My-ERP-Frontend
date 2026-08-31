import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { MsIcon } from '../../components/ui/MsIcon';
import { useCompleteGoogleMutation } from '../../features/auth/authApi';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const handoff = useMemo(() => params.get('handoff') || '', [params]);
  const navigate = useNavigate();
  const [completeGoogle] = useCompleteGoogleMutation();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!handoff) {
      setError('Google sign-in did not return a valid session.');
      return undefined;
    }

    let cancelled = false;
    completeGoogle({ handoff })
      .unwrap()
      .then(() => {
        if (!cancelled) navigate('/app', { replace: true });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.data?.message || 'Google sign-in expired. Please try again.');
      });

    return () => {
      cancelled = true;
    };
  }, [handoff, completeGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-md">
      <main className="w-full max-w-[480px] bg-surface border border-outline-variant rounded-xl shadow-stitch p-xl text-center">
        <MsIcon name="login" className="text-primary text-[32px] mb-md" />
        <h1 className="font-headline-md text-headline-md text-on-background mb-md">Google Workspace</h1>
        {error ? (
          <>
            <AuthError>{error}</AuthError>
            <Link to="/login" className="st-btn-primary">Try again</Link>
          </>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant">Finishing Google sign-in…</p>
        )}
      </main>
    </div>
  );
}
