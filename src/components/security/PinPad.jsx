export function PinPad({ value, onChange, onSubmit, disabled, length = 4 }) {
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
    <div className="pin-pad">
      <div className="pin-dots" aria-hidden="true">
        {Array.from({ length }).map((_, index) => (
          <span key={index} className={`pin-dot ${index < value.length ? 'is-filled' : ''}`} />
        ))}
      </div>
      <div className="pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) => {
          if (!key) return <span key="blank" />;
          const isDelete = key === '⌫';
          return (
            <button
              key={key}
              type="button"
              className={`pin-key ${isDelete ? 'is-muted' : ''}`}
              disabled={disabled}
              onClick={() => (isDelete ? backspace() : press(key))}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
