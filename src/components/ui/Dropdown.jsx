import { useEffect, useRef, useState } from 'react';
import { clsx } from '../../utils/format';

export function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div className={clsx('dropdown-menu', `align-${align}`)} role="menu">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger = false }) {
  return (
    <button type="button" className={clsx('dropdown-item', danger && 'is-danger')} onClick={onClick}>
      {children}
    </button>
  );
}
