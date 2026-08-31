import { useState } from 'react';
import { Alert, Badge, Button, Card, CardHeader, ConfirmationDialog, EmptyState, Input, ListSkeleton, Select, Tabs } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { SHARE_PERMISSIONS, SHARE_RESOURCE_LABELS } from '../../constants';
import {
  useAddGroupMemberMutation,
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useGetGroupsQuery,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberMutation,
  useUpdateGroupMutation,
} from '../../features/groups/groupsApi';
import {
  useGetInboxSharesQuery,
  useGetOutgoingSharesQuery,
  useRevokeShareMutation,
  useUpdateShareMutation,
} from '../../features/shares/sharesApi';
import { formatDateTime } from '../../utils/format';

const TABS = [
  { id: 'inbox', label: 'Shared with you' },
  { id: 'outgoing', label: 'You shared' },
  { id: 'groups', label: 'Groups' },
];

export function SharingPage() {
  const { push } = useToast();
  const [tab, setTab] = useState('inbox');
  const { data: inboxData, isLoading: inboxLoading } = useGetInboxSharesQuery();
  const { data: outgoingData, isLoading: outgoingLoading } = useGetOutgoingSharesQuery();
  const { data: groupsData, isLoading: groupsLoading } = useGetGroupsQuery();
  const [revokeShare, revokeState] = useRevokeShareMutation();
  const [updateShare] = useUpdateShareMutation();
  const [createGroup, createState] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup, deleteState] = useDeleteGroupMutation();
  const [addMember] = useAddGroupMemberMutation();
  const [updateMember] = useUpdateGroupMemberMutation();
  const [removeMember, removeMemberState] = useRemoveGroupMemberMutation();
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState({});
  const [rename, setRename] = useState({});
  const [removing, setRemoving] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);

  const inbox = inboxData?.data?.shares || [];
  const outgoing = outgoingData?.data?.shares || [];
  const groups = groupsData?.data?.groups || [];

  async function handleCreateGroup(event) {
    event.preventDefault();
    try {
      await createGroup(groupForm).unwrap();
      setGroupForm({ name: '', description: '' });
      push({ tone: 'success', title: 'Group created' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to create group' });
    }
  }

  return (
    <div className="st-page settings-grid sharing-page">
      <header className="page-hero">
        <p className="page-kicker">Collaboration</p>
        <h1 className="st-page-title">Sharing & groups</h1>
        <p className="page-lead">Share a selected note, password, or ENV collection. The rest of the account stays private.</p>
      </header>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'inbox' ? (
        <Card>
          <CardHeader title="Shared with you" subtitle="Active grants only. Expired or revoked items disappear here." />
          {inboxLoading && !inbox.length ? (
            <ListSkeleton variant="card" count={3} />
          ) : !inbox.length ? (
            <EmptyState icon="users" title="Nothing shared yet" message="When someone shares an item, it appears here with the permission they chose." />
          ) : (
            <div className="share-list">
              {inbox.map((share) => (
                <article key={share.id} className="share-card swipe-card">
                  <div>
                    <strong>{share.title}</strong>
                    <p className="muted">{SHARE_RESOURCE_LABELS[share.resourceType] || share.resourceType} · {share.permission}</p>
                  </div>
                  <Badge>{share.permission}</Badge>
                </article>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {tab === 'outgoing' ? (
        <Card>
          <CardHeader title="Items you shared" subtitle="Revoke or tighten permission without exposing secret values." />
          {outgoingLoading && !outgoing.length ? (
            <ListSkeleton variant="card" count={3} />
          ) : !outgoing.length ? (
            <EmptyState icon="lock" title="No outgoing shares" message="Use Share on a note, vault entry, or ENV collection." />
          ) : (
            <div className="share-list">
              {outgoing.map((share) => (
                <article key={share.id} className="share-card swipe-card">
                  <div>
                    <strong>{share.title}</strong>
                    <p className="muted">
                      {share.targetType === 'group' ? share.target?.name : share.target?.email}
                      {share.expiresAt ? ` · expires ${formatDateTime(share.expiresAt)}` : ''}
                    </p>
                  </div>
                  <Select
                    value={share.permission}
                    onChange={async (event) => {
                      try {
                        await updateShare({ shareId: share.id, permission: event.target.value }).unwrap();
                        push({ tone: 'success', title: 'Permission updated' });
                      } catch (err) {
                        push({ tone: 'danger', title: err?.data?.message || 'Unable to update share' });
                      }
                    }}
                  >
                    {SHARE_PERMISSIONS.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </Select>
                  <Button size="sm" variant="ghost" onClick={() => setRevoking(share)}>Revoke</Button>
                </article>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {tab === 'groups' ? (
        <>
          <Card>
            <CardHeader title="New group" subtitle="Example: Development Team. Members inherit item shares aimed at the group." />
            <form className="auth-form" onSubmit={handleCreateGroup}>
              <Input label="Name" value={groupForm.name} onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))} required />
              <Input label="Description" value={groupForm.description} onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))} />
              <Button type="submit" loading={createState.isLoading}>Create group</Button>
            </form>
          </Card>

          {groupsLoading && !groups.length ? <ListSkeleton variant="card" count={2} /> : null}
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader
                title={group.name}
                subtitle={`${group.memberCount || group.members?.length || 0} members · your role: ${group.permission}`}
                action={group.owner ? (
                  <Button size="sm" variant="ghost" onClick={() => setRemoving(group)}>Delete</Button>
                ) : null}
              />
              {group.owner ? (
                <div className="group-rename">
                  <Input
                    value={rename[group.id] ?? group.name}
                    onChange={(event) => setRename((current) => ({ ...current, [group.id]: event.target.value }))}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await updateGroup({ groupId: group.id, name: rename[group.id] || group.name }).unwrap();
                        push({ tone: 'success', title: 'Group renamed' });
                      } catch (err) {
                        push({ tone: 'danger', title: err?.data?.message || 'Unable to rename group' });
                      }
                    }}
                  >
                    Rename
                  </Button>
                </div>
              ) : null}

              <div className="member-list">
                {(group.members || []).map((member) => (
                  <div key={member.id} className="member-row">
                    <div>
                      <strong>{member.user?.name || member.user?.email}</strong>
                      <p className="muted">{member.user?.email}</p>
                    </div>
                    <Select
                      value={member.permission}
                      disabled={!group.owner}
                      onChange={async (event) => {
                        try {
                          await updateMember({
                            groupId: group.id,
                            userId: member.userId,
                            permission: event.target.value,
                          }).unwrap();
                          push({ tone: 'success', title: 'Member permission updated' });
                        } catch (err) {
                          push({ tone: 'danger', title: err?.data?.message || 'Unable to update member' });
                        }
                      }}
                    >
                      {SHARE_PERMISSIONS.map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </Select>
                    {group.owner && member.userId !== group.ownerId ? (
                      <Button size="sm" variant="ghost" onClick={() => setRemovingMember({ group, member })}>
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>

              {group.permission === 'share' || group.permission === 'admin' ? (
                <form
                  className="member-add"
                  onSubmit={(event) => {
                    event.preventDefault();
                    addMember({ groupId: group.id, email: memberEmail[group.id], permission: 'view' })
                      .unwrap()
                      .then(() => {
                        setMemberEmail((current) => ({ ...current, [group.id]: '' }));
                        push({ tone: 'success', title: 'Member added' });
                      })
                      .catch((err) => push({ tone: 'danger', title: err?.data?.message || 'Unable to add member' }));
                  }}
                >
                  <Input
                    type="email"
                    placeholder="Add member by email"
                    value={memberEmail[group.id] || ''}
                    onChange={(event) => setMemberEmail((current) => ({ ...current, [group.id]: event.target.value }))}
                    required
                  />
                  <Button type="submit" size="sm">Add</Button>
                </form>
              ) : (
                <Alert tone="info">You can view this group but cannot invite members.</Alert>
              )}
            </Card>
          ))}
        </>
      ) : null}

      <ConfirmationDialog
        open={Boolean(removing)}
        title="Delete this group?"
        message="Members lose group access and shares aimed at the group are revoked."
        confirmLabel="Delete group"
        loading={deleteState.isLoading}
        onConfirm={async () => {
          try {
            await deleteGroup(removing.id).unwrap();
            setRemoving(null);
            push({ tone: 'success', title: 'Group deleted' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to delete group' });
          }
        }}
        onClose={() => setRemoving(null)}
      />
      <ConfirmationDialog
        open={Boolean(revoking)}
        title="Revoke this share?"
        message={`${revoking?.title || 'This item'} will disappear for the other person immediately.`}
        confirmLabel="Revoke"
        loading={revokeState.isLoading}
        onClose={() => setRevoking(null)}
        onConfirm={async () => {
          try {
            await revokeShare(revoking.id).unwrap();
            setRevoking(null);
            push({ tone: 'success', title: 'Share revoked' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to revoke share' });
          }
        }}
      />
      <ConfirmationDialog
        open={Boolean(removingMember)}
        title="Remove this member?"
        message={`${removingMember?.member?.user?.email || 'This person'} will lose group access.`}
        confirmLabel="Remove"
        loading={removeMemberState.isLoading}
        onClose={() => setRemovingMember(null)}
        onConfirm={async () => {
          try {
            await removeMember({
              groupId: removingMember.group.id,
              userId: removingMember.member.userId,
            }).unwrap();
            setRemovingMember(null);
            push({ tone: 'success', title: 'Member removed' });
          } catch (err) {
            push({ tone: 'danger', title: err?.data?.message || 'Unable to remove member' });
          }
        }}
      />
    </div>
  );
}
