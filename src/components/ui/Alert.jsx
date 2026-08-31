import { clsx } from '../../utils/format';
import { Icon } from './Icon';

const icons = { info: 'info', success: 'check', warning: 'alert', danger: 'alert' };

export function Alert({ tone = 'info', title, children }) {
  return (
    <div className={clsx('alert', `alert-${tone}`)} role="status">
      <Icon name={icons[tone] || 'info'} size={18} />
      <div>
        {title ? <strong>{title}</strong> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}
