import { Button } from './Button';
import { Icon } from './Icon';

export function EmptyState({ icon = 'empty', title, message, actionLabel, onAction }) {
  return (
    <div className="state-block" role="status">
      <span className="state-icon">
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
