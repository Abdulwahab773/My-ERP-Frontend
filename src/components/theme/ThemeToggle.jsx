import { Icon } from '../ui/Icon';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { useTheme } from '../../hooks/useTheme';

const options = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'monitor' },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const current = options.find((item) => item.id === mode) || options[2];

  return (
    <Dropdown
      trigger={
        <button type="button" className="icon-btn" aria-label={`Theme: ${current.label}`}>
          <Icon name={current.icon} />
        </button>
      }
    >
      {options.map((option) => (
        <DropdownItem key={option.id} onClick={() => setMode(option.id)}>
          {option.label}
          {mode === option.id ? ' ·' : ''}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
