import { clsx } from '../../utils/format';

export function MsIcon({ name, filled = false, className, size }) {
  return (
    <span
      className={clsx('material-symbols-outlined', filled && 'fill', className)}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
