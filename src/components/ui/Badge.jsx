import { clsx } from '../../utils/format';

export function Badge({ children, tone = 'neutral', className }) {
  return <span className={clsx('badge', `badge-${tone}`, className)}>{children}</span>;
}
