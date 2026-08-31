import { Badge, Button, Card } from '../ui';
import { formatCurrency, formatDate } from '../../utils/format';
import { GoalProgress } from './GoalProgress';

const TONES = {
  income: 'accent',
  expense_limit: 'gold',
  saving: 'success',
  custom: 'neutral',
};

export function GoalCard({
  goal,
  currency,
  compact = false,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onDelete,
}) {
  const tone = goal.exceeded ? 'danger' : goal.achieved ? 'success' : TONES[goal.type] || 'accent';
  const statusTone = goal.overdue || goal.exceeded
    ? 'danger'
    : goal.achieved || goal.status === 'completed'
      ? 'success'
      : goal.status === 'paused'
        ? 'gold'
        : 'neutral';

  return (
    <Card className={`goal-card ${goal.achieved ? 'is-success' : ''} ${goal.exceeded || goal.overdue ? 'is-warning' : ''}`}>
      <div className="goal-card-top">
        <div>
          <p className="page-kicker">{goal.typeLabel}</p>
          <h3>{goal.title}</h3>
          <div className="chip-row" style={{ marginTop: 8 }}>
            <Badge tone={statusTone}>{goal.status}</Badge>
            {goal.priority ? <Badge>{goal.priority}</Badge> : null}
            {goal.recurrence === 'monthly' ? <Badge tone="gold">Monthly</Badge> : null}
          </div>
        </div>
        <GoalProgress percent={goal.percent} message={goal.message} tone={tone} size={compact ? 72 : 88} />
      </div>
      <div className="goal-metrics">
        <div>
          <p className="muted">Current</p>
          <strong>{formatCurrency(goal.currentAmount, currency)}</strong>
        </div>
        <div>
          <p className="muted">Target</p>
          <strong>{formatCurrency(goal.targetAmount, currency)}</strong>
        </div>
        <div>
          <p className="muted">Deadline</p>
          <strong>{goal.deadline ? formatDate(goal.deadline) : '—'}</strong>
        </div>
      </div>
      {goal.approaching ? <p className="goal-warn">Deadline approaching — {goal.daysRemaining} day{goal.daysRemaining === 1 ? '' : 's'} left.</p> : null}
      {goal.overdue ? <p className="goal-warn is-danger">This goal is overdue.</p> : null}
      {goal.description && !compact ? <p className="muted">{goal.description}</p> : null}
      {!compact && (onEdit || onPause || onComplete || onDelete) ? (
        <div className="row-actions" style={{ marginTop: 12 }}>
          {onEdit ? <Button size="sm" variant="ghost" onClick={() => onEdit(goal)}>Edit</Button> : null}
          {goal.storedStatus === 'paused' && onResume ? (
            <Button size="sm" variant="ghost" onClick={() => onResume(goal)}>Resume</Button>
          ) : onPause && goal.storedStatus !== 'completed' ? (
            <Button size="sm" variant="ghost" onClick={() => onPause(goal)}>Pause</Button>
          ) : null}
          {onComplete && goal.storedStatus !== 'completed' ? (
            <Button size="sm" variant="ghost" onClick={() => onComplete(goal)}>Complete</Button>
          ) : null}
          {onDelete ? <Button size="sm" variant="ghost" onClick={() => onDelete(goal)}>Delete</Button> : null}
        </div>
      ) : null}
    </Card>
  );
}
