import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { Loader } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { useGetAuthConfigQuery, useLoginMutation } from '../../features/auth/authApi';

const GOOGLE_ERRORS = {
  google: 'Google sign-in did not complete. Please try again.',
  google_denied: 'Google sign-in was cancelled.',
  google_state: 'Google sign-in could not be verified. Please try again.',
  google_unconfigured: 'Google sign-in is not configured on this server.',
  google_secret: 'Google rejected this app secret. Copy a new Client Secret from Google Cloud into server/.env, then restart the API.',
  google_redirect: 'Google redirect URI must be exactly http://localhost:5000/api/v1/auth/google/callback',
  google_network: 'Could not reach Google (network or SSL). Turn off VPN/antivirus HTTPS scan and try again.',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();
  const { data: config, isError: configError, isLoading: configLoading } = useGetAuthConfigQuery();
  const googleEnabled = config?.data?.googleEnabled === true;
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [error, setError] = useState('');

  const googleError = useMemo(() => {
    const code = new URLSearchParams(location.search).get('error');
    return GOOGLE_ERRORS[code] || '';
  }, [location.search]);

  function update(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form).unwrap();
      push({ tone: 'success', title: 'Welcome back', message: 'Your workspace is ready.' });
      navigate(location.state?.from || '/app', { replace: true });
    } catch (err) {
      setError(err?.data?.message || 'Unable to sign in');
    }
  }

  const message = googleError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-md lg:p-margin-desktop">
      <main className="w-full max-w-[480px] bg-surface border border-outline-variant rounded-xl shadow-stitch relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary" />
        <div className="p-xl flex-1 flex flex-col">
          <header className="text-center mb-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high mb-md border border-outline-variant">
              <MsIcon name="api" className="text-primary text-[24px]" />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Aether</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Secure access to your personal workspace</p>
          </header>

          <AuthError title="Authentication Failed">{message}</AuthError>

          <GoogleButton
            enabled={googleEnabled}
            loading={configLoading}
            offline={configError}
          />

          <div className="relative flex items-center justify-center mb-lg">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative bg-surface px-md">
              <span className="font-label-md text-label-md text-outline">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          <form className="flex flex-col gap-md" onSubmit={onSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Enterprise Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                  <MsIcon name="mail" className="text-[20px]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={update}
                  placeholder="user@company.com"
                  className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Master Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                  <MsIcon name="lock" className="text-[20px]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={update}
                  placeholder="••••••••••••"
                  className="block w-full pl-xl pr-sm py-sm bg-surface border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-xs mb-sm">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={update}
                  className="h-4 w-4 rounded border-outline text-primary focus:ring-primary bg-surface"
                />
                <label className="ml-sm font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                  Keep session active
                </label>
              </div>
              <Link to="/forgot-password" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">
                Recover Vault
              </Link>
            </div>

            <button className="st-btn-primary mt-xs" type="submit" disabled={isLoading}>
              {isLoading ? <Loader size="sm" /> : null}
              {isLoading ? 'Authenticating…' : 'Authenticate Session'}
              {isLoading ? null : <MsIcon name="arrow_forward" className="ml-xs text-[18px]" />}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-low border-t border-outline-variant p-md text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Deploying a new instance?
            <Link to="/register" className="font-label-md text-label-md text-primary hover:underline ml-base transition-colors">
              Initialize Aether
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
