import { MsIcon } from '../ui/MsIcon';

function scorePassword(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9!@#$%^&*]/.test(password)) score += 1;
  if (password.length > 12) score += 1;
  return password.length ? score : 0;
}

const LEVELS = {
  0: { label: 'Security Level: None', color: 'bg-surface-dim', text: 'text-on-surface-variant' },
  1: { label: 'Security Level: Weak', color: 'bg-error', text: 'text-error' },
  2: { label: 'Security Level: Fair', color: 'bg-on-tertiary-container', text: 'text-on-tertiary-container' },
  3: { label: 'Security Level: Good', color: 'bg-primary-fixed-dim', text: 'text-primary' },
  4: { label: 'Security Level: Strong', color: 'bg-primary', text: 'text-primary' },
};

function Req({ met, children }) {
  return (
    <li className={`flex items-center gap-xs ${met ? 'text-on-background' : 'text-on-surface-variant'}`}>
      <MsIcon
        name={met ? 'check_circle' : 'radio_button_unchecked'}
        filled={met}
        className={`text-[16px] ${met ? 'text-primary' : 'text-outline'}`}
      />
      {children}
    </li>
  );
}

export function PasswordPolicy({ password = '' }) {
  const hasLength = password.length >= 8;
  const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumSym = /[0-9!@#$%^&*]/.test(password);
  const score = scorePassword(password);
  const level = LEVELS[score] || LEVELS[0];

  return (
    <div className="mt-xs bg-surface-container-low p-sm rounded-lg border border-outline-variant/50">
      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-surface-variant mb-sm">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full w-1/4 transition-all duration-300 ${score >= step ? level.color : 'bg-surface-dim'}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center mb-xs">
        <span className={`font-label-md text-label-md uppercase tracking-wider text-[10px] ${level.text}`}>
          {level.label}
        </span>
      </div>
      <ul className="flex flex-col gap-1 font-body-sm text-body-sm">
        <Req met={hasLength}>Minimum 8 characters</Req>
        <Req met={hasCase}>Includes uppercase & lowercase</Req>
        <Req met={hasNumSym}>Includes a number or symbol</Req>
      </ul>
    </div>
  );
}
