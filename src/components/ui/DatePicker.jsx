import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { clsx } from '../../utils/format';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePicker({ label, value, onChange, error }) {
  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(selected || new Date());

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const blanks = first.getDay();
    const total = daysInMonth(cursor);
    const cells = Array.from({ length: blanks }, () => null);
    for (let day = 1; day <= total; day += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    return cells;
  }, [cursor]);

  const labelText = selected
    ? selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select date';

  return (
    <div className="datepicker field">
      {label ? <span className="field-label">{label}</span> : null}
      <button type="button" className={clsx('field-control datepicker-trigger', error && 'is-invalid')} onClick={() => setOpen((v) => !v)}>
        <Icon name="calendar" size={16} />
        <span>{labelText}</span>
      </button>
      {error ? <span className="field-error">{error}</span> : null}
      {open ? (
        <div className="datepicker-pop">
          <div className="datepicker-nav">
            <button type="button" className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <Icon name="chevronLeft" size={16} />
            </button>
            <strong>
              {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </strong>
            <button type="button" className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <Icon name="chevronRight" size={16} />
            </button>
          </div>
          <div className="datepicker-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <span key={`${day}-${index}`} className="datepicker-dow">
                {day}
              </span>
            ))}
            {grid.map((date, index) =>
              date ? (
                <button
                  key={toIsoDate(date)}
                  type="button"
                  className={clsx('datepicker-day', value === toIsoDate(date) && 'is-selected')}
                  onClick={() => {
                    onChange?.(toIsoDate(date));
                    setOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
