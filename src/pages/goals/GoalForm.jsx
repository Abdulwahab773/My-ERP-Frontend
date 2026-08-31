import { useState } from 'react';
import { Button, Checkbox, DatePicker, Input, Modal, Select } from '../../components/ui';
import { GOAL_PRIORITIES, GOAL_REMINDER_OFFSETS, GOAL_TYPES } from '../../constants';
import { currentMonthKey } from '../../utils/format';

const EMPTY = {
  title: '',
  type: 'income',
  targetAmount: '',
  currentAmount: '',
  month: currentMonthKey(),
  deadline: '',
  description: '',
  priority: 'medium',
  recurrence: 'none',
  reminderEnabled: true,
  reminderOffsets: [7, 3, 1, 0],
};

export function GoalForm({ open, goal, month, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(() => goalToForm(goal, month));

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function toggleOffset(id) {
    setForm((current) => {
      const has = current.reminderOffsets.includes(id);
      return {
        ...current,
        reminderOffsets: has
          ? current.reminderOffsets.filter((item) => item !== id)
          : [...current.reminderOffsets, id],
      };
    });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      title: form.title,
      type: form.type,
      targetAmount: Number(form.targetAmount),
      currentAmount: form.currentAmount === '' ? undefined : Number(form.currentAmount),
      month: form.month,
      deadline: form.deadline || undefined,
      description: form.description,
      priority: form.priority,
      recurrence: form.recurrence,
      reminderEnabled: form.reminderEnabled,
      reminderOffsets: form.reminderOffsets,
      autoProgress: form.type === 'custom' ? false : form.currentAmount === '',
    });
  }

  const needsManual = form.type === 'custom' || form.type === 'saving';

  return (
    <Modal
      open={open}
      title={goal ? 'Edit goal' : 'Create goal'}
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="goal-form" type="submit" loading={saving}>Save goal</Button>
        </>
      )}
    >
      <form id="goal-form" className="auth-form" onSubmit={submit}>
        <Select label="Type" name="type" value={form.type} onChange={update}>
          {GOAL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </Select>
        <Input label="Title" name="title" value={form.title} onChange={update} placeholder="Monthly Income Goal" />
        <Input label="Target amount" name="targetAmount" type="number" min="0.01" step="0.01" value={form.targetAmount} onChange={update} required placeholder="0.00" />
        {needsManual ? (
          <Input label="Current amount" name="currentAmount" type="number" min="0" step="0.01" value={form.currentAmount} onChange={update} placeholder="0.00" />
        ) : null}
        <Input label="Month" name="month" type="month" value={form.month} onChange={update} />
        <DatePicker label="Deadline" value={form.deadline} onChange={(value) => setForm((current) => ({ ...current, deadline: value }))} />
        <Select label="Priority" name="priority" value={form.priority} onChange={update}>
          {GOAL_PRIORITIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </Select>
        <Select label="Recurrence" name="recurrence" value={form.recurrence} onChange={update}>
          <option value="none">Does not repeat</option>
          <option value="monthly">Monthly</option>
        </Select>
        <label className="field">
          <span className="field-label">Description</span>
          <span className="field-control profile-bio-wrap">
            <textarea name="description" rows={3} value={form.description} onChange={update} placeholder="What are you aiming for?" />
          </span>
        </label>
        <Checkbox name="reminderEnabled" label="Email reminders" checked={form.reminderEnabled} onChange={update} />
        {form.reminderEnabled ? (
          <div className="goal-reminders">
            {GOAL_REMINDER_OFFSETS.map((item) => (
              <Checkbox
                key={item.id}
                label={item.label}
                checked={form.reminderOffsets.includes(item.id)}
                onChange={() => toggleOffset(item.id)}
              />
            ))}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}

function goalToForm(goal, month) {
  if (!goal) return { ...EMPTY, month: month || currentMonthKey() };
  return {
    title: goal.title || '',
    type: goal.type,
    targetAmount: goal.targetAmount ?? '',
    currentAmount: goal.currentAmount ?? '',
    month: goal.month,
    deadline: goal.deadline ? String(goal.deadline).slice(0, 10) : '',
    description: goal.description || '',
    priority: goal.priority || 'medium',
    recurrence: goal.recurrence || 'none',
    reminderEnabled: goal.reminderEnabled !== false,
    reminderOffsets: goal.reminderOffsets || [7, 3, 1, 0],
  };
}
