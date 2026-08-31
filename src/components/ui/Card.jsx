import { clsx } from '../../utils/format';

export function Card({ children, className, padded = true, as: Tag = 'section', ...props }) {
  return (
    <Tag className={clsx('card', padded && 'card-padded', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="card-header">
      <div>
        {title ? <h3 className="card-title">{title}</h3> : null}
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
