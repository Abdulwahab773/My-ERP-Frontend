import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Modal, Select } from '../../components/ui';
import { DatePicker } from '../../components/ui/DatePicker';
import { ACCOUNTS, DEBT_TYPES } from '../../constants';
import { todayIso } from '../../utils/format';

export function DebtForm({ open, item, people, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(() => empty(item));

  useEffect(() => {
    if (open) setForm(empty(item));
  }, [open, item]);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      type: form.type,
      counterparty: form.counterparty,
      amount: Number(form.amount),
      date: form.date,
      dueDate: form.dueDate || undefined,
      account: form.account || undefined,
      reminder: form.reminder,
      note: form.note,
    });
  }

  return (
    <Modal
      open={open}
      title={item ? 'Edit debt' : 'Record debt'}
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="debt-form" type="submit" loading={loading}>Save</Button>
        </>
      )}
    >
      <form id="debt-form" className="auth-form" onSubmit={handleSubmit}>
        <Select label="Type" name="type" value={form.type} onChange={update} disabled={Boolean(item)}>
          {DEBT_TYPES.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.label}</option>
          ))}
        </Select>
        <Input
          label="Person or lender"
          name="counterparty"
          value={form.counterparty}
          onChange={update}
          required
          list="debt-people"
          placeholder="Ayan Habib"
        />
        <datalist id="debt-people">
          {(people || []).map((person) => (
            <option key={person.id} value={person.name} />
          ))}
        </datalist>
        {!item ? (
          <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} required placeholder="0.00" />
        ) : null}
        <Select label={form.type === 'lent' ? 'Paid from' : 'Received into'} name="account" value={form.account} onChange={update} disabled={Boolean(item)}>
          <option value="">Don’t move balances yet</option>
          {ACCOUNTS.map((account) => (
            <option key={account.id} value={account.id}>{account.label}</option>
          ))}
        </Select>
        <DatePicker label="Date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
        <DatePicker label="Due date" value={form.dueDate} onChange={(value) => setForm((current) => ({ ...current, dueDate: value }))} />
        <Input label="Notes" name="note" value={form.note} onChange={update} placeholder="Optional note" />
        <Checkbox label="Remind me about the due date" name="reminder" checked={form.reminder} onChange={update} />
      </form>
    </Modal>
  );
}

function empty(item) {
  return {
    type: item?.type || 'borrowed',
    counterparty: item?.counterparty || item?.person || '',
    amount: item?.principal || '',
    account: item?.account || '',
    date: item?.occurredAt ? String(item.occurredAt).slice(0, 10) : todayIso(),
    dueDate: item?.dueDate ? String(item.dueDate).slice(0, 10) : '',
    note: item?.note || '',
    reminder: Boolean(item?.reminder),
  };
}
