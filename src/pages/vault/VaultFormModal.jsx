import { useEffect, useState } from 'react';
import { Button, Input, Modal, PasswordInput, Select } from '../../components/ui';
import { VAULT_CATEGORIES } from '../../constants';
import { parseTags } from '../../utils/htmlText';
import { generatePassword } from '../../utils/generatePassword';
import { PasswordGenerator } from './PasswordGenerator';

const DEFAULT_OPTIONS = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};

export function VaultFormModal({ open, item, onClose, onSubmit, loading }) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState(() => emptyForm(item));
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  useEffect(() => {
    if (open) setForm(emptyForm(item));
  }, [open, item]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      username: form.username.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
      category: form.category,
      tags: parseTags(form.tags),
      favorite: form.favorite,
    };
    if (form.password) payload.password = form.password;
    onSubmit(payload);
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit entry' : 'Store password'}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="vault-form" type="submit" loading={loading}>
            {isEdit ? 'Save entry' : 'Store password'}
          </Button>
        </>
      }
    >
      <form id="vault-form" className="auth-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <Input label="Name" name="title" value={form.title} onChange={update} required placeholder="Facebook" />
          <Select label="Category" name="category" value={form.category} onChange={update}>
            {VAULT_CATEGORIES.map((itemName) => (
              <option key={itemName} value={itemName}>{itemName}</option>
            ))}
          </Select>
        </div>
        <Input label="Username / email" name="username" value={form.username} onChange={update} placeholder="example@email.com" />
        <Input label="Website URL" name="url" value={form.url} onChange={update} placeholder="https://facebook.com" />
        <PasswordInput
          label={isEdit ? 'New password (leave blank to keep)' : 'Password'}
          name="password"
          value={form.password}
          onChange={update}
          required={!isEdit}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <PasswordGenerator
          value={form.password}
          options={options}
          setOptions={setOptions}
          onChange={(password) => setForm((current) => ({ ...current, password }))}
        />
        <Input label="Tags" name="tags" value={form.tags} onChange={update} placeholder="work, personal" />
        <label className="field">
          <span className="field-label">Notes</span>
          <span className="field-control profile-bio-wrap">
            <textarea name="notes" rows={3} value={form.notes} onChange={update} maxLength={500} placeholder="Optional notes" />
          </span>
        </label>
        <button
          type="button"
          className="text-link"
          onClick={() => setForm((current) => ({ ...current, password: generatePassword(options) }))}
        >
          Fill with a generated password
        </button>
      </form>
    </Modal>
  );
}

function emptyForm(item) {
  return {
    title: item?.title || '',
    username: item?.username || '',
    url: item?.url || item?.website || '',
    notes: item?.memo || '',
    category: item?.category || 'Other',
    tags: (item?.tags || []).join(', '),
    password: '',
    favorite: Boolean(item?.favorite),
  };
}
