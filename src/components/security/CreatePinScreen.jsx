import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '../auth/AuthError';
import { Loader } from '../ui';
import { MsIcon } from '../ui/MsIcon';
import { PinKeypad } from './PinKeypad';
import { useCreatePinMutation } from '../../features/security/securityApi';
import { useLogoutMutation } from '../../features/auth/authApi';

export function CreatePinScreen() {
  const navigate = useNavigate();
  const [createPin, { isLoading }] = useCreatePinMutation();
  const [logout] = useLogoutMutation();
  const [step, setStep] = useState('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const current = step === 'enter' ? pin : confirmPin;
  const matched = step === 'confirm' && confirmPin.length === 4 && confirmPin === pin;

  async function save() {
    setError('');
    try {
      await createPin({ pin, confirmPin }).unwrap();
    } catch (err) {
      setError(err?.data?.errors?.[0]?.message || err?.data?.message || 'Unable to save PIN');
      setStep('enter');
      setPin('');
      setConfirmPin('');
    }
  }

  function handleChange(next) {
    setMismatch(false);
    if (step === 'enter') {
      setPin(next);
      if (next.length === 4) {
        window.setTimeout(() => {
          setStep('confirm');
          setConfirmPin('');
        }, 280);
      }
      return;
    }
    setConfirmPin(next);
    if (next.length === 4 && next !== pin) {
      setMismatch(true);
      window.setTimeout(() => {
        setStep('enter');
        setPin('');
        setConfirmPin('');
        setMismatch(false);
      }, 900);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center font-body-md">
      <main className="w-full max-w-[480px] px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center flex-1">
        <div className="text-center mb-xl w-full">
          <MsIcon name="lock" filled className="text-primary mb-md" size={48} />
          <h1 className="font-display-lg text-display-lg text-primary mb-sm">Secure Entry</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] mx-auto">
            This PIN secures your Money, Vault, ENV secrets, and Reports. Choose a 4-digit code.
          </p>
        </div>

        <div className="w-full bg-surface border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-center mb-lg">
          <div className="text-center w-full mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
              {step === 'enter' ? 'Create PIN' : 'Confirm PIN'}
            </h2>
            <p className={`font-body-sm text-body-sm ${mismatch ? 'text-error' : matched ? 'text-primary' : 'text-on-surface-variant'}`}>
              {mismatch ? 'PINs do not match. Try again.' : matched ? 'PINs match. You can save.' : step === 'enter' ? 'Enter 4 digits' : 'Re-enter to verify'}
            </p>
          </div>
          <AuthError>{error}</AuthError>
          <PinKeypad
            value={current}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className={`w-full transition-opacity duration-300 ${matched ? '' : 'opacity-50 pointer-events-none'}`}>
          <button
            type="button"
            className="w-full bg-primary text-on-primary font-label-md text-label-md rounded h-12 flex items-center justify-center tracking-wide uppercase hover:bg-primary-container transition-colors"
            onClick={save}
            disabled={!matched || isLoading}
          >
            {isLoading ? <Loader size="sm" /> : null}
            {isLoading ? 'Saving…' : 'Save PIN'}
          </button>
        </div>

        <button
          type="button"
          className="mt-lg font-label-md text-label-md text-secondary hover:text-primary"
          onClick={async () => { await logout(); navigate('/login'); }}
        >
          Sign out
        </button>
      </main>
    </div>
  );
}
