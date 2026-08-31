import { useEffect, useState } from 'react';
import { Button, Modal } from '../ui';
import { listConflicts, removeConflict } from '../../pwa/conflicts';
import { useUpdateNoteMutation } from '../../features/notes/notesApi';
import { useUpdateExpenseRecordMutation, useUpdateIncomeRecordMutation } from '../../features/finance/financeApi';

function preview(value) {
  if (!value) return '—';
  if (typeof value === 'string') return value.slice(0, 180);
  return JSON.stringify({
    title: value.title,
    amount: value.amount,
    note: value.note,
    category: value.category,
  });
}

export function ConflictResolver({ open, onClose }) {
  const [rows, setRows] = useState([]);
  const [updateNote] = useUpdateNoteMutation();
  const [updateIncome] = useUpdateIncomeRecordMutation();
  const [updateExpense] = useUpdateExpenseRecordMutation();

  useEffect(() => {
    if (open) listConflicts().then(setRows);
  }, [open]);

  async function keepServer(row) {
    await removeConflict(row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
  }

  async function keepMine(row) {
    const client = row.client || {};
    if (row.module === 'notes') {
      await updateNote({ noteId: row.recordId, ...client, baseVersion: row.server?.version }).unwrap();
    } else if (row.module === 'income') {
      await updateIncome({ incomeId: row.recordId, ...client, baseVersion: row.server?.version }).unwrap();
    } else if (row.module === 'expenses') {
      await updateExpense({ expenseId: row.recordId, ...client, baseVersion: row.server?.version }).unwrap();
    }
    await removeConflict(row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
  }

  return (
    <Modal open={open} title="Resolve sync conflicts" onClose={onClose} size="lg">
      {!rows.length ? (
        <p className="muted">No conflicts. Offline and online copies match.</p>
      ) : (
        <div className="conflict-list">
          {rows.map((row) => (
            <article key={row.id} className="conflict-card">
              <p className="page-kicker">{row.module}</p>
              <p>{row.message}</p>
              <div className="conflict-grid">
                <div>
                  <strong>Server</strong>
                  <pre>{preview(row.server)}</pre>
                </div>
                <div>
                  <strong>Your offline edit</strong>
                  <pre>{preview(row.client)}</pre>
                </div>
              </div>
              <div className="install-actions">
                <Button size="sm" variant="secondary" onClick={() => keepServer(row)}>Keep server</Button>
                <Button size="sm" onClick={() => keepMine(row)}>Keep mine</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}
