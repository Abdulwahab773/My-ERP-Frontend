import { APP_NAME } from '../../constants';

export function Logo({ inverted = false, compact = false }) {
  return (
    <div className={`brand${compact ? ' is-compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">A</span>
      <span className="brand-copy">
        <strong style={inverted ? { color: '#f6f1e7' } : undefined}>{APP_NAME}</strong>
        <span style={inverted ? { color: 'rgba(246,241,231,0.62)' } : undefined}>Personal ERP</span>
      </span>
    </div>
  );
}
