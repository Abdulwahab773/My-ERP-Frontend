import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export function PromptDialog({
  open,
  title = 'Rename',
  label,
  value = '',
  placeholder,
  confirmLabel = 'Save',
  loading = false,
  onSubmit,
  onClose,
}) {
  const [text, setText] = useState(value);

  useEffect(() => {
    if (open) setText(value || '');
  }, [open, value]);

  function submit(event) {
    event.preventDefault();
    const next = text.trim();
    if (!next) return;
    onSubmit?.(next);
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="prompt-dialog" type="submit" loading={loading} disabled={!text.trim()}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <form id="prompt-dialog" className="auth-form" onSubmit={submit}>
        <Input
          label={label}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      </form>
    </Modal>
  );
}
