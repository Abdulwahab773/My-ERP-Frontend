import { Select } from '../../components/ui';
import { currentMonthKey, monthLabel, shiftMonthKey } from '../../utils/format';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function MonthNavigator({ value, onChange, maxOffset = 1 }) {
  const current = currentMonthKey();
  const parsed = String(value || current).split('-');
  const year = Number(parsed[0]);
  const month = Number(parsed[1]);
  const max = shiftMonthKey(current, maxOffset);
  const min = shiftMonthKey(current, -60);
  const years = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - 6 + index);

  function setMonthYear(nextYear, nextMonth) {
    const key = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    if (key < min || key > max) return;
    onChange(key);
  }

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <button type="button" className="px-3 py-1.5 rounded-full border border-outline-variant font-label-md text-on-surface-variant hover:bg-surface-container-low" onClick={() => onChange(shiftMonthKey(value, -1))} disabled={shiftMonthKey(value, -1) < min}>
        Previous
      </button>
      <button type="button" className="px-3 py-1.5 rounded-full border border-outline-variant font-label-md text-on-surface-variant hover:bg-surface-container-low" onClick={() => onChange(shiftMonthKey(value, 1))} disabled={shiftMonthKey(value, 1) > max}>
        Next
      </button>
      <Select
        className="w-[140px]"
        value={month}
        aria-label="Select month"
        onChange={(event) => setMonthYear(year, Number(event.target.value))}
      >
        {MONTHS.map((item) => (
          <option key={item} value={item}>
            {monthLabel(`${year}-${String(item).padStart(2, '0')}`).split(' ')[0]}
          </option>
        ))}
      </Select>
      <Select
        className="w-[110px]"
        value={year}
        aria-label="Select year"
        onChange={(event) => setMonthYear(Number(event.target.value), month)}
      >
        {years.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </Select>
      <button
        type="button"
        className={`px-3 py-1.5 rounded-full font-label-md ${value === current ? 'bg-primary-container text-on-primary-container' : 'border border-outline-variant text-on-surface-variant'}`}
        onClick={() => onChange(current)}
      >
        This month
      </button>
    </div>
  );
}
