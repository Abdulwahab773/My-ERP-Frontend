import { useState } from 'react';
import { Button, Input, Modal, Select } from '../ui';
import { useToast } from '../ui/Toast';
import { SHARE_PERMISSIONS } from '../../constants';
import { useGetGroupsQuery } from '../../features/groups/groupsApi';
import { useCreateShareMutation } from '../../features/shares/sharesApi';

export function ShareModal({ open, resourceType, resourceId, title, onClose }) {
  const { push } = useToast();
  const { data } = useGetGroupsQuery(undefined, { skip: !open });
  const [createShare, { isLoading }] = useCreateShareMutation();
  const groups = data?.data?.groups || [];
  const [target, setTarget] = useState('user');
  const [email, setEmail] = useState('');
  const [groupId, setGroupId] = useState('');
  const [permission, setPermission] = useState('view');
  const [expiresAt, setExpiresAt] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await createShare({
        resourceType,
        resourceId,
        permission,
        expiresAt: expiresAt || undefined,
        ...(target === 'user' ? { email } : { groupId, targetType: 'group' }),
      }).unwrap();
      push({ tone: 'success', title: 'Shared', message: `${title || 'Item'} is now available to the recipient.` });
      setEmail('');
      onClose();
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to share this item' });
    }
  }

  return (
    <Modal
      open={open}
      title="Share this item"
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="share-form" type="submit" loading={isLoading}>Share</Button>
        </>
      )}
    >
      <form id="share-form" className="auth-form" onSubmit={submit}>
        <p className="muted">Only this {resourceType === 'secret' ? 'collection' : resourceType} is shared. Your account stays private.</p>
        <Select label="Share with" value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="user">Specific person</option>
          <option value="group">Group</option>
        </Select>
        {target === 'user' ? (
          <Input
            label="Recipient email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            required
          />
        ) : (
          <Select label="Group" value={groupId} onChange={(event) => setGroupId(event.target.value)} required>
            <option value="">Choose a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Select>
        )}
        <Select label="Permission" value={permission} onChange={(event) => setPermission(event.target.value)}>
          {SHARE_PERMISSIONS.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </Select>
        <Input
          label="Expires (optional)"
          type="datetime-local"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </form>
    </Modal>
  );
}
