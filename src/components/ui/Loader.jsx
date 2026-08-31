import { clsx } from '../../utils/format';

export function Loader({ size = 'md', label, className }) {
  return (
    <span className={clsx('aether-loader', `aether-loader-${size}`, className)} role="status" aria-label={label || 'Loading'}>
      <span className="aether-loader-ring" aria-hidden="true">
        <span className="aether-loader-orbit" />
        <span className="aether-loader-orbit is-inner" />
        <span className="aether-loader-core">A</span>
      </span>
      {label ? <span className="aether-loader-label">{label}</span> : null}
    </span>
  );
}
