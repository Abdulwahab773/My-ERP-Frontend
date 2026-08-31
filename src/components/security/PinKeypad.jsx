import { MsIcon } from '../ui/MsIcon';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export function PinKeypad({ value, onChange, onSubmit, disabled, length = 4, variant = 'dots' }) {
  function press(digit) {
    if (disabled) return;
    if (value.length >= length) return;
    const next = `${value}${digit}`;
    onChange(next);
    if (next.length === length) {
      window.setTimeout(() => onSubmit?.(next), 80);
    }
  }

  function backspace() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center">
      {variant === 'boxes' ? (
        <div className="flex gap-md mb-xl" aria-label="PIN entry" role="group">
          {Array.from({ length }).map((_, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-lg border bg-surface flex items-center justify-center ${index < value.length ? 'border-primary shadow-sm' : 'border-outline-variant'}`}
            >
              <div className={`w-4 h-4 rounded-full pin-dot ${index < value.length ? 'bg-primary filled' : 'bg-transparent'}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-md mb-xl" aria-label="PIN entry" role="group">
          {Array.from({ length }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 pin-dot ${index < value.length ? 'filled border-primary' : 'border-outline-variant'}`}
            />
          ))}
        </div>
      )}

      <div className={`grid grid-cols-3 ${variant === 'boxes' ? 'gap-xs' : 'gap-sm w-full max-w-[280px]'}`}>
        {KEYS.map((key, index) => {
          if (!key) return <div key={`blank-${index}`} className={variant === 'boxes' ? 'w-[64px] h-[64px]' : 'h-16'} />;
          if (key === 'back') {
            return (
              <button
                key="back"
                type="button"
                aria-label="Delete"
                disabled={disabled}
                onClick={backspace}
                className={`keypad-btn rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high ${variant === 'boxes' ? 'w-[64px] h-[64px] rounded-lg' : 'h-16'}`}
              >
                <MsIcon name="backspace" />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => press(key)}
              className={`keypad-btn rounded flex items-center justify-center text-on-surface hover:bg-surface-container-high ${variant === 'boxes' ? 'w-[64px] h-[64px] rounded-lg font-headline-md text-headline-md' : 'h-16 font-headline-lg text-headline-lg'}`}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
