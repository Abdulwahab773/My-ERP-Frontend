import { useMemo, useState } from 'react';
import { Badge, Button, Drawer, EmptyState, Select } from '../ui';
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../features/notifications/notificationsApi';
import { formatDateTime } from '../../utils/format';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'security.login', label: 'Security' },
  { id: 'goal.reminder', label: 'Goals' },
  { id: 'finance.expense_limit', label: 'Finance' },
  { id: 'share.received', label: 'Sharing' },
  { id: 'sync.failure', label: 'Sync' },
];

export function NotificationCenter({ open, onClose }) {
  const [filter, setFilter] = useState('');
  const params = useMemo(() => {
    if (filter === 'unread') return { unread: 'true' };
    if (filter) return { type: filter };
    return {};
  }, [filter]);
  const { data } = useGetNotificationsQuery(params, { skip: !open, pollingInterval: open ? 30000 : 0 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();
  const items = data?.data?.items || [];
  const unread = data?.data?.unread || 0;

  return (
    <Drawer open={open} title="Notifications" onClose={onClose} side="right">
      <div className="notify-toolbar">
        <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {FILTERS.map((item) => (
            <option key={item.id || 'all'} value={item.id}>{item.label}</option>
          ))}
        </Select>
        <Button size="sm" variant="ghost" onClick={() => markAll()} disabled={!unread}>
          Mark all read
        </Button>
      </div>
      {!items.length ? (
        <EmptyState icon="bell" title="You are caught up" message="Goal, security, and sharing alerts appear here." />
      ) : (
        <div className="notify-list">
          {items.map((item) => (
            <article key={item.id} className={`notify-item ${item.read ? '' : 'is-unread'}`}>
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.body}</p>
                <span className="muted">{formatDateTime(item.createdAt)}</span>
              </div>
              <div className="notify-actions">
                {!item.read ? (
                  <Button size="sm" variant="ghost" onClick={() => markRead(item.id)}>Read</Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {unread ? <Badge tone="accent">{unread} unread</Badge> : null}
    </Drawer>
  );
}
