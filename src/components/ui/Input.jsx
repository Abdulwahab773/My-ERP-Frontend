import { clsx } from '../../utils/format';

export function Input({
  label,
  hint,
  error,
  id,
  className,
  leftSlot,
  rightSlot,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <label className={clsx('field', className)} htmlFor={inputId}>
      {label ? <span className="field-label">{label}</span> : null}
      <span className={clsx('field-control', error && 'is-invalid', leftSlot && 'has-left', rightSlot && 'has-right')}>
        {leftSlot}
        <input id={inputId} {...props} />
        {rightSlot}
      </span>
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
