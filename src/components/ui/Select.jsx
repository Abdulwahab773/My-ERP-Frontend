import { Children, Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../utils/format';
import { Icon } from './Icon';

function extractLabel(children) {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractLabel).join('');
  if (typeof children === 'object' && children.props) return extractLabel(children.props.children);
  return '';
}

function collectOptions(nodes, list = []) {
  Children.forEach(nodes, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (Array.isArray(child)) {
      collectOptions(child, list);
      return;
    }
    if (typeof child !== 'object') return;
    if (child.type === Fragment) {
      collectOptions(child.props.children, list);
      return;
    }
    if (child.type === 'optgroup') {
      collectOptions(child.props.children, list);
      return;
    }
    list.push({
      value: child.props.value === undefined ? '' : child.props.value,
      label: extractLabel(child.props.children) || String(child.props.value ?? ''),
      disabled: Boolean(child.props.disabled),
    });
  });
  return list;
}

function emitChange(onChange, name, value) {
  onChange?.({
    target: { name: name || '', value },
    currentTarget: { name: name || '', value },
  });
}

export function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  placeholder,
  disabled = false,
  value,
  onChange,
  name,
  required,
  ...props
}) {
  const uid = useId();
  const inputId = id || name || uid;
  const options = useMemo(() => collectOptions(children), [children]);
  const selected = options.find((item) => String(item.value) === String(value ?? ''));
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function placeMenu() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = Math.min(280, options.length * 40 + 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12 && rect.top > spaceBelow;
    setCoords({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 180) - 8)),
      width: Math.max(rect.width, 180),
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    placeMenu();
    const onReposition = () => placeMenu();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event) => {
      if (
        triggerRef.current?.contains(event.target)
        || menuRef.current?.contains(event.target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  function pick(option) {
    if (option.disabled) return;
    emitChange(onChange, name, option.value);
    setOpen(false);
  }

  const shown = selected?.label || placeholder || 'Select';
  const isPlaceholder = !selected && Boolean(placeholder);

  return (
    <div className={clsx('field select-field', className)}>
      {label ? <span className="field-label" id={`${inputId}-label`}>{label}</span> : null}
      <button
        {...props}
        id={inputId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={clsx('field-control select-trigger', error && 'is-invalid', open && 'is-open', isPlaceholder && 'is-placeholder')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${inputId}-label` : undefined}
        aria-label={props['aria-label'] || label}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
      >
        <span className="select-value">{shown}</span>
        <Icon name="chevronDown" size={16} className="select-caret" />
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ''} required={required} /> : null}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}

      {open && coords
        ? createPortal(
          <div
            ref={menuRef}
            className="select-menu"
            role="listbox"
            style={{
              left: coords.left,
              width: coords.width,
              top: coords.top,
              bottom: coords.bottom,
            }}
          >
            {options.map((option) => {
              const active = String(option.value) === String(value ?? '');
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  className={clsx('select-option', active && 'is-active')}
                  onClick={() => pick(option)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )
        : null}
    </div>
  );
}
