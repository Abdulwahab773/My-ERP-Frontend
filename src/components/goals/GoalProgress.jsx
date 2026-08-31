import { clsx } from '../../utils/format';

export function GoalProgress({
  percent = 0,
  message,
  tone = 'accent',
  size = 88,
}) {
  const shown = Math.min(100, Math.max(0, Number(percent) || 0));
  const over = Number(percent) > 100;

  return (
    <div className="goal-progress">
      <div
        className={clsx('goal-ring', `tone-${tone}`, over && 'is-over')}
        style={{
          '--p': shown,
          width: size,
          height: size,
        }}
        role="img"
        aria-label={`${Math.round(percent)} percent`}
      >
        <span>{Math.round(percent)}%</span>
      </div>
      {message ? <p className={clsx('goal-caption', over && 'is-danger')}>{message}</p> : null}
    </div>
  );
}
