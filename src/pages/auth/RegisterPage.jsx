import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthError } from '../../components/auth/AuthError';
import { PasswordPolicy } from '../../components/auth/PasswordPolicy';
import { Loader, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { CURRENCY_OPTIONS } from '../../constants';
import { useRegisterMutation } from '../../features/auth/authApi';
import { passwordMeetsPolicy } from '../../utils/passwordStrength';

export function RegisterPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [register, { isLoading }] = useRegisterMutation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'USD',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    if (!passwordMeetsPolicy(form.password)) {
      setError('Password must include uppercase, lowercase, and a number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register(form).unwrap();
      push({
        tone: 'success',
        title: 'Workspace created',
        message: 'Check your inbox to verify your email.',
      });
      setCreated(true);
    } catch (err) {
      const details = err?.data?.errors?.map((item) => item.message).join(' ');
      setError(details || err?.data?.message || 'Unable to create account');
    }
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen relative overflow-hidden" id="registration-view">
      <div className="w-full lg:w-[500px] xl:w-[600px] flex-shrink-0 flex flex-col px-margin-mobile lg:px-margin-desktop py-lg lg:py-xl overflow-y-auto no-scrollbar z-10 bg-background relative shadow-[4px_0_24px_rgba(15,23,42,0.03)] border-r border-outline-variant/30">
        <div className="mb-xl flex items-center gap-xs">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
            <MsIcon name="widgets" filled className="text-sm" />
          </div>
          <span className="font-headline-md text-headline-md text-primary tracking-tight">Aether</span>
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-lg">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-xs">Initialize Workspace</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your details to configure your personal ERP environment.</p>
          </div>

          <form className="flex flex-col gap-md" onSubmit={onSubmit}>
            <AuthError title="Could not create workspace">{error}</AuthError>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="flex flex-col gap-base">
                <label className="st-label" htmlFor="firstName">FIRST NAME</label>
                <input id="firstName" name="firstName" required autoComplete="given-name" value={form.firstName} onChange={update} placeholder="Satoshi" className="h-10 px-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline" />
              </div>
              <div className="flex flex-col gap-base">
                <label className="st-label" htmlFor="lastName">LAST NAME</label>
                <input id="lastName" name="lastName" required autoComplete="family-name" value={form.lastName} onChange={update} placeholder="Nakamoto" className="h-10 px-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline" />
              </div>
            </div>

            <div className="flex flex-col gap-base">
              <label className="st-label" htmlFor="email">PROFESSIONAL EMAIL</label>
              <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={update} placeholder="satoshi@example.com" className="h-10 px-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline" />
            </div>

            <div className="flex flex-col gap-base relative">
              <label className="st-label" htmlFor="password">MASTER PASSWORD</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update}
                  placeholder="••••••••"
                  className="w-full h-10 pl-sm pr-10 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <MsIcon name={showPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
                </button>
              </div>
              <PasswordPolicy password={form.password} />
            </div>

            <div className="flex flex-col gap-base">
              <label className="st-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" value={form.confirmPassword} onChange={update} placeholder="••••••••" className="h-10 px-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md placeholder:text-outline" />
            </div>

            <div className="flex flex-col gap-base mb-sm">
              <label className="st-label" htmlFor="currency">BASE CURRENCY</label>
              <Select id="currency" name="currency" value={form.currency} onChange={update} aria-label="Base currency">
                {CURRENCY_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
            </div>

            <button className="h-12 w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md rounded flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(21,21,125,0.15)] disabled:opacity-50" type="submit" disabled={isLoading}>
              {isLoading ? <Loader size="sm" /> : null}
              <span>{isLoading ? 'Creating…' : 'Create Account'}</span>
              <MsIcon name="arrow_forward" className="text-sm" />
            </button>
          </form>

          <div className="mt-lg text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an operational workspace?
              <Link to="/login" className="text-primary hover:text-primary-container font-medium hover:underline underline-offset-4 decoration-primary/30 transition-colors ml-1">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="mt-auto pt-lg flex items-center justify-between font-label-md text-label-md text-outline">
          <span>© {new Date().getFullYear()} Aether Systems</span>
        </div>
      </div>

      <div className="hidden lg:block flex-grow relative bg-surface-container-high overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 mix-blend-multiply"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDD6MGTKg_9a7p-Gah8gw6zcjrJk24XJ0oDQefY35ZFnNcXfF752CePsXDt75OSLcpr1tifDZC6_akFF3IPv8bIUL7KnKrAEB7HI2ihv66D3-SnXqN3CzDPL4if6Kaca9-hombCb8QE6OWfuYmEuBXO7ijCuOJeVeTdiQ9HsIFw6ULYmXdyYnsW57A3VwDdYfzfR5jbEdZI-wO8flRCybBkNgz8r3YNLiXop_X9xTwURxP9AWwGdqk5')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low/80 via-transparent to-primary/5" />
        <div className="absolute top-margin-desktop right-margin-desktop flex gap-xs">
          <div className="px-sm py-1 rounded-full border border-outline-variant/30 bg-surface/50 backdrop-blur-sm font-data-mono text-data-mono text-secondary text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            System Status: Nominal
          </div>
        </div>
      </div>

      {created ? (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-margin-mobile">
          <div className="bg-surface max-w-md w-full rounded-xl border border-outline-variant shadow-stitch-lg p-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-lg relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
              <MsIcon name="check_circle" filled className="text-3xl text-primary" />
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-xs tracking-tight">Workspace Created</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Your personal Aether ERP environment has been initialized. Please check your email to verify your identity and activate the master node.</p>
            <div className="w-full bg-surface-container-low border border-outline-variant/50 rounded p-sm mb-xl flex items-start gap-sm text-left">
              <MsIcon name="mail" className="text-secondary mt-0.5" />
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-0.5">Verification sent to</p>
                <p className="font-data-mono text-data-mono text-on-background">{form.email}</p>
              </div>
            </div>
            <button
              className="h-10 px-lg bg-surface-container-highest hover:bg-surface-dim text-on-background font-label-md text-label-md rounded border border-outline-variant transition-colors w-full"
              type="button"
              onClick={() => navigate('/app', { replace: true })}
            >
              Open workspace
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
