import { useState } from 'react';
import { Input } from './Input';
import { Icon } from './Icon';

export function PasswordInput({ ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete || 'current-password'}
      rightSlot={
        <button
          type="button"
          className="field-icon-btn"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={16} />
        </button>
      }
    />
  );
}
