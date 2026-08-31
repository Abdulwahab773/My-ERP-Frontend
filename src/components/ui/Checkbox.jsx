import { clsx } from '../../utils/format';

export function Checkbox({ label, checked, onChange, name, className }) {
  return (
    <label className={clsx('check', className)}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
