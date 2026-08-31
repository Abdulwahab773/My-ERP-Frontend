import { useState } from 'react';
import { AuthError } from '../auth/AuthError';
import { MsIcon } from '../ui/MsIcon';
import { PinKeypad } from './PinKeypad';
import {
  useForgotPinMutation,
  useResetPinMutation,
  useUnlockPinMutation,
  useVerifyPinOtpMutation,
} from '../../features/security/securityApi';

export function PinLockScreen({ lockedUntil }) {
  const [unlockPin, { isLoading: unlocking }] = useUnlockPinMutation();
  const [forgotPin, { isLoading: sending }] = useForgotPinMutation();
  const [verifyPinOtp, { isLoading: verifying }] = useVerifyPinOtpMutation();
  const [resetPin, { isLoading: resetting }] = useResetPinMutation();

  const [mode, setMode] = useState('unlock');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleUnlock(value) {
    setError('');
    try {
      await unlockPin({ pin: value }).unwrap();
    } catch (err) {
      setError(err?.data?.message || 'Incorrect PIN');
      setPin('');
    }
  }

  async function sendOtp() {
    setError('');
    setInfo('');
    try {
      await forgotPin().unwrap();
      setInfo('We sent a 6-digit code to your verified email.');
      setMode('otp');
    } catch (err) {
      setError(err?.data?.message || 'Unable to send code');
    }
  }

  async function submitOtp(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await verifyPinOtp({ code: otp }).unwrap();
      setResetToken(result.data.resetToken);
      setMode('reset');
    } catch (err) {
      setError(err?.data?.message || 'Incorrect code');
    }
  }

  async function submitReset(value) {
    const confirmed = value || confirmPin;
    if (confirmed !== nextPin) {
      setError('PINs do not match');
      setNextPin('');
      setConfirmPin('');
      return;
    }
    setError('');
    try {
      await resetPin({ resetToken, pin: nextPin, confirmPin: confirmed }).unwrap();
    } catch (err) {
      setError(err?.data?.message || 'Unable to reset PIN');
    }
  }

  const lockMessage = lockedUntil
    ? `Too many attempts. Try again after ${new Date(lockedUntil).toLocaleTimeString()}.`
    : null;

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop antialiased">
      <main className="w-full max-w-[400px] flex flex-col items-center">
        <div className="mb-lg flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-low text-primary">
          <MsIcon name="shield_lock" filled className="text-[32px]" />
        </div>
        <div className="text-center mb-xl">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-base">
            {mode === 'unlock' ? 'Enter Security PIN' : mode === 'otp' ? 'Check your email' : 'Choose a new PIN'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {mode === 'unlock' ? 'Please authenticate to access the Vault.' : mode === 'otp' ? 'Enter the 6-digit code we sent.' : 'Re-enter a 4-digit PIN to finish reset.'}
          </p>
        </div>

        {lockMessage ? <AuthError title="Temporarily locked">{lockMessage}</AuthError> : null}
        <AuthError>{error}</AuthError>
        {info ? <p className="font-body-sm text-body-sm text-primary mb-md">{info}</p> : null}

        {mode === 'unlock' ? (
          <>
            <PinKeypad
              value={pin}
              onChange={setPin}
              onSubmit={handleUnlock}
              disabled={unlocking || Boolean(lockedUntil)}
              variant="boxes"
            />
            <div className="w-full flex flex-col gap-lg items-center px-lg mt-xl">
              <button
                type="button"
                className="w-full h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:bg-primary-container uppercase tracking-wider disabled:opacity-50"
                onClick={() => pin.length === 4 && handleUnlock(pin)}
                disabled={unlocking || pin.length !== 4}
              >
                {unlocking ? 'Unlocking…' : 'Unlock'}
              </button>
              <button type="button" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors hover:underline" onClick={sendOtp} disabled={sending}>
                {sending ? 'Sending…' : 'Forgot PIN?'}
              </button>
            </div>
          </>
        ) : null}

        {mode === 'otp' ? (
          <form className="w-full flex flex-col gap-md" onSubmit={submitOtp}>
            <input
              className="st-input text-center tracking-[0.4em]"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
            />
            <button type="submit" className="st-btn-primary" disabled={verifying || otp.length !== 6}>
              {verifying ? 'Verifying…' : 'Verify code'}
            </button>
            <button type="button" className="st-btn-ghost" onClick={() => setMode('unlock')}>Back</button>
          </form>
        ) : null}

        {mode === 'reset' ? (
          <>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              {nextPin.length < 4 ? 'New 4-digit PIN' : 'Confirm new PIN'}
            </p>
            <PinKeypad
              value={nextPin.length < 4 ? nextPin : confirmPin}
              onChange={nextPin.length < 4 ? setNextPin : setConfirmPin}
              onSubmit={nextPin.length < 4 ? setNextPin : submitReset}
              disabled={resetting}
              variant="boxes"
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
