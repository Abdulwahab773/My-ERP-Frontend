import { clsx } from '../../utils/format';

export function Skeleton({ width, height = 14, radius = 8, className }) {
  return (
    <span
      className={clsx('skeleton', className)}
      style={{ width: width || '100%', height, borderRadius: radius }}
    />
  );
}
