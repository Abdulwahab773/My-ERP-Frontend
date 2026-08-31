import { Input } from './Input';
import { Icon } from './Icon';

export function SearchInput({ value, onChange, placeholder = 'Search', ...props }) {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type="search"
      leftSlot={<Icon name="search" size={16} />}
      {...props}
    />
  );
}
