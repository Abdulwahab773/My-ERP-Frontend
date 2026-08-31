export function ProgressBar({ value = 0, max = 100, label, tone = 'accent' }) {
  const percent = Math.min(100, Math.max(0, (Number(value) / Number(max || 1)) * 100));

  return (
    <div className="progress">
      {label ? (
        <div className="progress-meta">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      ) : null}
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <span className={`progress-fill tone-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
