import { Select } from '../../components/ui';
import { currentMonthKey, historicalMonths, monthLabel, shiftMonthKey } from '../../utils/format';
import { MsIcon } from '../../components/ui/MsIcon';

export function MonthSelector({ value, onChange }) {
  const current = currentMonthKey();
  const options = historicalMonths(36);

  return (
    <Select
      className="min-w-[180px]"
      value={value || current}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Select month"
    >
      {options.map((key) => (
        <option key={key} value={key}>{monthLabel(key)}</option>
      ))}
    </Select>
  );
}

export function MonthPill({ value, onChange, maxOffset = 1 }) {
  const current = currentMonthKey();
  const max = shiftMonthKey(current, maxOffset);
  const min = shiftMonthKey(current, -60);

  return (
    <div className="flex items-center gap-sm bg-surface rounded-full border border-outline-variant p-1 shadow-sm">
      <button
        type="button"
        className="p-xs hover:bg-surface-container-highest rounded-full text-on-surface-variant hover:text-primary"
        onClick={() => onChange(shiftMonthKey(value, -1))}
        disabled={shiftMonthKey(value, -1) < min}
        aria-label="Previous month"
      >
        <MsIcon name="chevron_left" />
      </button>
      <span className="font-label-md text-label-md text-on-background px-md min-w-[120px] text-center">{monthLabel(value)}</span>
      <button
        type="button"
        className="p-xs hover:bg-surface-container-highest rounded-full text-on-surface-variant hover:text-primary"
        onClick={() => onChange(shiftMonthKey(value, 1))}
        disabled={shiftMonthKey(value, 1) > max}
        aria-label="Next month"
      >
        <MsIcon name="chevron_right" />
      </button>
    </div>
  );
}
