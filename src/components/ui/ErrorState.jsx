import { Button } from './Button';
import { Icon } from './Icon';

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-block" role="alert">
      <span className="state-icon danger">
        <Icon name="alert" />
      </span>
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
