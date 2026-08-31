import { clsx } from '../../utils/format';
import { Icon } from './Icon';
import { Loader } from './Loader';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, fullWidth && 'btn-block', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader size="sm" /> : icon ? <Icon name={icon} size={16} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
