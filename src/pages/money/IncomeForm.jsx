import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui';
import { DatePicker } from '../../components/ui/DatePicker';
import { ACCOUNTS } from '../../constants';
import { todayIso } from '../../utils/format';

export function IncomeForm({ open, item, categories, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(() => empty(item));

  useEffect(() => {
    if (open) setForm(empty(item));
  }, [open, item]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'amount' || name === 'account') {
        const amount = Number(name === 'amount' ? value : next.amount) || 0;
        if (next.account === 'cash') {
          next.cashAmount = amount;
          next.bankAmount = 0;
        } else {
          next.bankAmount = amount;
          next.cashAmount = 0;
        }
      }
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      title: form.title,
      amount: Number(form.amount),
      cashAmount: Number(form.cashAmount) || 0,
      bankAmount: Number(form.bankAmount) || 0,
      category: form.category,
      account: form.account,
      source: form.source,
      date: form.date,
      note: form.note,
    });
  }

  return (
    <Modal
      open={open}
      title={item ? 'Edit income' : 'Record income'}
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="income-form" type="submit" loading={loading}>Save</Button>
        </>
      )}
    >
      <form id="income-form" className="auth-form" onSubmit={handleSubmit}>
        <Input label="Title" name="title" value={form.title} onChange={update} required placeholder="Salary, freelance invoice…" />
        <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} required placeholder="0.00" />
        <Input label="Source" name="source" value={form.source} onChange={update} placeholder="Employer, client, market" />
        <div className="field-row">
          <Select label="Category" name="category" value={form.category} onChange={update}>
            {categories.map((itemName) => (
              <option key={itemName} value={itemName}>{itemName}</option>
            ))}
          </Select>
          <Select label="Primary account" name="account" value={form.account} onChange={update}>
            {ACCOUNTS.map((account) => (
              <option key={account.id} value={account.id}>{account.label}</option>
            ))}
          </Select>
        </div>
        <div className="field-row">
          <Input label="To cash in hand" name="cashAmount" type="number" min="0" step="0.01" value={form.cashAmount} onChange={update} placeholder="0.00" />
          <Input label="To cash in bank" name="bankAmount" type="number" min="0" step="0.01" value={form.bankAmount} onChange={update} placeholder="0.00" />
        </div>
        <p className="field-hint">The two account amounts must equal the total.</p>
        <DatePicker label="Date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
        <Input label="Description" name="note" value={form.note} onChange={update} placeholder="Optional note" />
      </form>
    </Modal>
  );
}

function empty(item) {
  const amount = item?.amount || '';
  const cash = item?.cashAmount ?? (item?.account === 'cash' ? item.amount : 0);
  const bank = item?.bankAmount ?? (item?.account === 'bank' ? item.amount : '');
  return {
    title: item?.title || '',
    amount,
    cashAmount: cash || 0,
    bankAmount: bank || (item ? 0 : amount || 0),
    category: item?.category || 'Other',
    account: item?.account || 'bank',
    source: item?.source || '',
    date: item?.occurredAt ? String(item.occurredAt).slice(0, 10) : todayIso(),
    note: item?.note || '',
  };
}
