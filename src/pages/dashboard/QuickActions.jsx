import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Input, Modal, PasswordInput, Select } from '../../components/ui';
import { Button } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import {
  useCreateDebtMutation,
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  useCreateNoteMutation,
  useCreatePasswordMutation,
  useCreateSecretMutation,
  useUpsertGoalMutation,
} from '../../features/dashboard/dashboardApi';
import {
  ACCOUNTS,
  DEBT_TYPES,
  ENV_ENVIRONMENTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../constants';
import { todayIso } from '../../utils/format';

const TILES = [
  { id: 'income', label: 'Income', icon: 'add_circle', primary: true },
  { id: 'expense', label: 'Expense', icon: 'remove_circle' },
  { id: 'debt', label: 'Transfer', icon: 'swap_horiz' },
  { id: 'note', label: 'Note', icon: 'edit_document' },
];

const TITLES = {
  income: 'Record income',
  expense: 'Record expense',
  debt: 'Record debt',
  note: 'New note',
  password: 'Store password',
  secret: 'Store ENV secret',
  goal: 'Set a monthly goal',
};

function pinMessage(error) {
  if (error?.data?.code === 'PIN_LOCKED' || error?.data?.code === 'PIN_NOT_SET') {
    return error.data.message;
  }
  return error?.data?.errors?.[0]?.message || error?.data?.message || 'Unable to save';
}

export function QuickActions({ month, financeLocked }) {
  const navigate = useNavigate();
  const { push } = useToast();
  const [kind, setKind] = useState('');
  const [form, setForm] = useState({});
  const [createIncome, incomeState] = useCreateIncomeMutation();
  const [createExpense, expenseState] = useCreateExpenseMutation();
  const [createDebt, debtState] = useCreateDebtMutation();
  const [createNote, noteState] = useCreateNoteMutation();
  const [createPassword, passwordState] = useCreatePasswordMutation();
  const [createSecret, secretState] = useCreateSecretMutation();
  const [upsertGoal, goalState] = useUpsertGoalMutation();

  const saving = [incomeState, expenseState, debtState, noteState, passwordState, secretState, goalState]
    .some((item) => item.isLoading);

  function open(nextKind) {
    setKind(nextKind);
    setForm({
      date: todayIso(),
      account: nextKind === 'income' ? 'bank' : 'cash',
      category: 'Other',
      type: nextKind === 'debt' ? 'borrowed' : 'income',
      environment: 'development',
      month,
    });
  }

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      if (kind === 'income') {
        await createIncome({
          title: form.title,
          amount: Number(form.amount),
          category: form.category,
          account: form.account,
          date: form.date,
          note: form.note,
        }).unwrap();
      } else if (kind === 'expense') {
        await createExpense({
          title: form.title,
          amount: Number(form.amount),
          category: form.category,
          account: form.account,
          date: form.date,
          note: form.note,
        }).unwrap();
      } else if (kind === 'debt') {
        await createDebt({
          type: form.type,
          counterparty: form.counterparty,
          amount: Number(form.amount),
          dueDate: form.dueDate,
          note: form.note,
        }).unwrap();
      } else if (kind === 'note') {
        await createNote({ title: form.title, body: form.body }).unwrap();
      } else if (kind === 'password') {
        await createPassword({
          title: form.title,
          username: form.username,
          website: form.website,
          password: form.password,
        }).unwrap();
      } else if (kind === 'secret') {
        await createSecret({
          name: form.name,
          environment: form.environment,
          value: form.value,
        }).unwrap();
      } else if (kind === 'goal') {
        await upsertGoal({
          title: form.title,
          type: form.type,
          targetAmount: Number(form.amount),
          month,
          deadline: form.deadline,
        }).unwrap();
      }
      push({ tone: 'success', title: 'Saved to your workspace' });
      setKind('');
    } catch (error) {
      push({ tone: 'danger', title: pinMessage(error) });
    }
  }

  function handleAction(id) {
    const needsPin = ['income', 'expense', 'debt', 'password', 'secret'].includes(id);
    if (needsPin && financeLocked) {
      push({
        tone: 'info',
        title: 'Unlock your Security PIN',
        message: 'Money and vault writes are checked on the server.',
      });
      navigate(id === 'password' ? '/app/vault' : id === 'secret' ? '/app/secrets' : '/app/money');
      return;
    }
    open(id);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
        {TILES.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action.id)}
            className={
              action.primary
                ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors rounded-lg py-sm px-4 flex flex-col items-center justify-center gap-xs shadow-sm'
                : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors rounded-lg py-sm px-4 flex flex-col items-center justify-center gap-xs'
            }
          >
            <MsIcon name={action.icon} />
            <span className="font-label-md text-label-md uppercase">{action.label}</span>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(kind)}
        title={TITLES[kind] || 'Add'}
        onClose={() => setKind('')}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setKind('')}>Cancel</Button>
            <Button form="dashboard-quick-form" type="submit" loading={saving}>Save</Button>
          </>
        )}
      >
        <form id="dashboard-quick-form" className="flex flex-col gap-md" onSubmit={submit}>
          {kind === 'income' || kind === 'expense' ? (
            <>
              <Input label={kind === 'income' ? 'Source' : 'Merchant'} name="title" value={form.title || ''} onChange={update} required placeholder={kind === 'income' ? 'Salary, freelance invoice…' : 'Shop, vendor, or payee'} />
              <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount || ''} onChange={update} required placeholder="0.00" />
              <Select label="Category" name="category" value={form.category || 'Other'} onChange={update}>
                {(kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
              <Select label="Account" name="account" value={form.account || 'cash'} onChange={update}>
                {ACCOUNTS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
              <DatePicker label="Date" value={form.date || todayIso()} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
            </>
          ) : null}

          {kind === 'debt' ? (
            <>
              <Select label="Type" name="type" value={form.type || 'borrowed'} onChange={update}>
                {DEBT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
              <Input label="Person or lender" name="counterparty" value={form.counterparty || ''} onChange={update} required placeholder="Ayan Habib" />
              <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount || ''} onChange={update} required placeholder="0.00" />
              <DatePicker label="Due date" value={form.dueDate || ''} onChange={(value) => setForm((current) => ({ ...current, dueDate: value }))} />
            </>
          ) : null}

          {kind === 'note' ? (
            <>
              <Input label="Title" name="title" value={form.title || ''} onChange={update} required placeholder="Untitled" />
              <label className="flex flex-col gap-xs">
                <span className="st-label">Note</span>
                <textarea name="body" rows={4} value={form.body || ''} onChange={update} className="st-input" placeholder="Capture a thought…" />
              </label>
            </>
          ) : null}

          {kind === 'password' ? (
            <>
              <Input label="Title" name="title" value={form.title || ''} onChange={update} required placeholder="Facebook" />
              <Input label="Username" name="username" value={form.username || ''} onChange={update} placeholder="example@email.com" />
              <Input label="Website" name="website" value={form.website || ''} onChange={update} placeholder="https://facebook.com" />
              <PasswordInput label="Password" name="password" value={form.password || ''} onChange={update} required placeholder="••••••••" />
            </>
          ) : null}

          {kind === 'secret' ? (
            <>
              <Input label="Name" name="name" value={form.name || ''} onChange={update} required placeholder="Greenwich Website" />
              <Select label="Environment" name="environment" value={form.environment || 'development'} onChange={update}>
                {ENV_ENVIRONMENTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
              <PasswordInput label="Value" name="value" value={form.value || ''} onChange={update} required placeholder="sk_live_…" />
            </>
          ) : null}

          {kind === 'goal' ? (
            <>
              <Select label="Goal" name="type" value={form.type || 'income'} onChange={update}>
                <option value="income">Income goal</option>
                <option value="expense_limit">Expense limit</option>
                <option value="saving">Saving goal</option>
                <option value="custom">Custom goal</option>
              </Select>
              <Input label="Title" name="title" value={form.title || ''} onChange={update} placeholder="Optional title" />
              <Input label="Target amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount || ''} onChange={update} required placeholder="0.00" />
              <DatePicker label="Deadline" value={form.deadline || ''} onChange={(value) => setForm((current) => ({ ...current, deadline: value }))} />
            </>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
