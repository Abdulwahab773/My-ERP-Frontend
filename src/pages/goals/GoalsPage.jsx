import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, ConfirmationDialog, EmptyState, ListSkeleton, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import {
  useCompleteGoalMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalsQuery,
  usePauseGoalMutation,
  useResumeGoalMutation,
  useUpdateGoalMutation,
} from '../../features/goals/goalsApi';
import { GOAL_TYPES } from '../../constants';
import { currentMonthKey, formatCurrency } from '../../utils/format';
import { MonthPill } from '../dashboard/MonthSelector';
import { GoalForm } from './GoalForm';

const TYPE_ICONS = {
  income: 'trending_up',
  expense_limit: 'receipt_long',
  saving: 'savings',
  custom: 'flag',
};

const PRIORITY_CLASS = {
  high: 'bg-secondary-container text-on-secondary-container',
  medium: 'bg-surface-variant text-on-surface-variant',
  low: 'bg-surface-variant text-on-surface-variant',
  critical: 'bg-error-container text-on-error-container',
};

export function GoalsPage() {
  const user = useSelector(selectUser);
  const currency = user?.currency || 'USD';
  const { push } = useToast();
  const [month, setMonth] = useState(currentMonthKey);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const { data, error, isLoading } = useGetGoalsQuery({
    month,
    type: type || undefined,
    status: status || undefined,
    q: query || undefined,
  });
  const [createGoal, createState] = useCreateGoalMutation();
  const [updateGoal, updateState] = useUpdateGoalMutation();
  const [deleteGoal, deleteState] = useDeleteGoalMutation();
  const [pauseGoal] = usePauseGoalMutation();
  const [resumeGoal] = useResumeGoalMutation();
  const [completeGoal] = useCompleteGoalMutation();
  const items = data?.data?.items || [];

  const overdue = useMemo(() => items.filter((item) => item.overdue), [items]);

  async function save(payload) {
    try {
      if (editing) await updateGoal({ goalId: editing.id, ...payload }).unwrap();
      else await createGoal(payload).unwrap();
      push({ tone: 'success', title: 'Goal saved' });
      setOpen(false);
      setEditing(null);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save goal' });
    }
  }

  async function act(fn, goal, title) {
    try {
      await fn(goal.id).unwrap();
      push({ tone: 'success', title });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to update goal' });
    }
  }

  return (
    <div className="st-page goals-page">
      <div className="goals-head">
        <div>
          <h1 className="st-page-title">Goals</h1>
          <p className="st-page-lead">Income targets, spend ceilings, and savings for this month.</p>
        </div>
        <MonthPill value={month} onChange={setMonth} />
      </div>

      {error ? <Alert tone="danger" title={error?.data?.message || 'Goals could not load'} /> : null}
      {overdue.map((item) => (
        <div key={item.id} className="bg-error-container border border-error/30 rounded-xl p-md flex items-start gap-md w-full">
          <MsIcon name="error" filled className="text-error mt-1" />
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-error-container">Overdue Goal</span>
            <span className="font-body-sm text-body-sm text-on-error-container opacity-90">{item.title} — {item.message}</span>
          </div>
        </div>
      ))}

      <div className="money-toolbar">
        <div className="money-search">
          <MsIcon name="search" />
          <input className="st-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search goals" />
        </div>
        <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="Goal type">
          <option value="">All types</option>
          {GOAL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Goal status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </Select>
      </div>

      {isLoading && !items.length ? (
        <ListSkeleton variant="tile" count={4} />
      ) : !items.length ? (
        <EmptyState
          icon="target"
          title="Nothing this month"
          message="Set an income target, expense ceiling, savings number, or a custom goal."
          actionLabel="Create goal"
          onAction={() => { setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="goals-grid">
          {items.map((goal) => {
            const percent = Math.min(100, Math.max(0, goal.percent || 0));
            const over = goal.exceeded || goal.overdue;
            return (
              <article key={goal.id} className="goal-tile">
                <div className="goal-tile-head">
                  <div className="goal-tile-title">
                    <MsIcon name={TYPE_ICONS[goal.type] || 'flag'} />
                    <h2 className="truncate">{goal.title}</h2>
                  </div>
                  <span className={`${PRIORITY_CLASS[goal.priority] || PRIORITY_CLASS.medium} font-label-md text-label-md px-2 py-1 rounded-full uppercase`}>
                    {goal.priority || 'Med'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="muted font-body-sm">Current</span>
                    <strong className={over ? 'text-error' : ''}>{formatCurrency(goal.currentAmount, currency)}</strong>
                  </div>
                  <div className={`goal-tile-bar ${over ? 'is-over' : ''}`}>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="muted font-body-sm">Target: {formatCurrency(goal.targetAmount, currency)}</span>
                    <span className={over ? 'text-error' : 'text-primary'}>{Math.round(percent)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between muted font-body-sm">
                  <span className="flex items-center gap-xs">
                    <MsIcon name="calendar_month" className="text-[18px]" />
                    {goal.daysRemaining != null ? `${goal.daysRemaining} days left` : 'No deadline'}
                  </span>
                  <span className={over ? 'text-error' : 'text-primary'}>{goal.status}</span>
                </div>
                <div className="goal-tile-actions">
                  <button type="button" className="money-icon-btn" aria-label="Edit goal" onClick={() => { setEditing(goal); setOpen(true); }}>
                    <MsIcon name="edit" className="text-[18px]" />
                  </button>
                  {goal.storedStatus === 'paused' ? (
                    <button type="button" className="st-btn-ghost" onClick={() => act(resumeGoal, goal, 'Goal resumed')}>Resume</button>
                  ) : goal.storedStatus !== 'completed' ? (
                    <button type="button" className="st-btn-ghost" onClick={() => act(pauseGoal, goal, 'Goal paused')}>Pause</button>
                  ) : null}
                  {goal.storedStatus !== 'completed' ? (
                    <button type="button" className="st-btn-ghost" onClick={() => act(completeGoal, goal, 'Goal completed')}>Complete</button>
                  ) : null}
                  <button type="button" className="money-icon-btn is-danger" aria-label="Delete goal" onClick={() => setRemoving(goal)}>
                    <MsIcon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </article>
            );
          })}
          <button
            type="button"
            className="goal-create"
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            <div className="goal-create-title">
              <MsIcon name="add_circle" />
              <h2>Create New Goal</h2>
            </div>
            <span className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl">Initialize Goal</span>
          </button>
        </div>
      )}

      {open ? (
        <GoalForm
          key={editing?.id || `new-${month}`}
          open={open}
          goal={editing}
          month={month}
          saving={createState.isLoading || updateState.isLoading}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSubmit={save}
        />
      ) : null}

      <ConfirmationDialog
        open={Boolean(removing)}
        title="Delete this goal?"
        message="The target and its reminder schedule will be removed. Ledger history is unchanged."
        confirmLabel="Delete"
        loading={deleteState.isLoading}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          try {
            await deleteGoal(removing.id).unwrap();
            push({ tone: 'success', title: 'Goal deleted' });
            setRemoving(null);
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete goal' });
          }
        }}
      />
    </div>
  );
}
