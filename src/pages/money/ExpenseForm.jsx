import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui';
import { DatePicker } from '../../components/ui/DatePicker';
import { ACCOUNTS } from '../../constants';
import { todayIso } from '../../utils/format';

export function ExpenseForm({ open, item, categories, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(() => empty(item));

  useEffect(() => {
    if (open) setForm(empty(item));
  }, [open, item]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      account: form.account,
      date: form.date,
      note: form.note,
    });
  }

  return (
    <Modal
      open={open}
      title={item ? 'Edit expense' : 'Record expense'}
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="expense-form" type="submit" loading={loading}>Save</Button>
        </>
      )}
    >
      <form id="expense-form" className="auth-form" onSubmit={handleSubmit}>
        <Input label="Merchant" name="title" value={form.title} onChange={update} required placeholder="Shop, vendor, or payee" />
        <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} required placeholder="0.00" />
        <Select label="Category" name="category" value={form.category} onChange={update} placeholder="Select category">
          {categories.map((itemName) => (
            <option key={itemName} value={itemName}>{itemName}</option>
          ))}
        </Select>
        <Select label="Account" name="account" value={form.account} onChange={update}>
          {ACCOUNTS.map((account) => (
            <option key={account.id} value={account.id}>{account.label}</option>
          ))}
        </Select>
        <DatePicker label="Date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
        <Input label="Description" name="note" value={form.note} onChange={update} placeholder="What was this for?" />
      </form>
    </Modal>
  );
}

function empty(item) {
  return {
    title: item?.title || '',
    amount: item?.amount || '',
    category: item?.category || 'Other',
    account: item?.account || 'cash',
    date: item?.occurredAt ? String(item.occurredAt).slice(0, 10) : todayIso(),
    note: item?.note || '',
  };
}
