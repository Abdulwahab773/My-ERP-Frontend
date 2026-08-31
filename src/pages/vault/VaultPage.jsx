import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  Icon,
  ListSkeleton,
  SearchInput,
  Select,
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { VAULT_CATEGORIES } from '../../constants';
import {
  useCreateVaultItemMutation,
  useDeleteVaultItemMutation,
  useFavoriteVaultItemMutation,
  useGetVaultItemsQuery,
  useGetVaultMetaQuery,
  useCopyVaultPasswordMutation,
  useRevealVaultPasswordMutation,
  useTouchVaultItemMutation,
  useUpdateVaultItemMutation,
} from '../../features/vault/vaultApi';
import { ShareModal } from '../../components/sharing/ShareModal';
import { useDebounce } from '../../hooks/useDebounce';
import { isOnline, subscribeToConnectivity } from '../../pwa/offline';
import { copyAndExpire, copyText } from '../../utils/clipboard';
import { formatDateTime } from '../../utils/format';
import { STRENGTH_LABELS } from '../../utils/passwordStrength';
import { VaultFormModal } from './VaultFormModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'recent', label: 'Recently used' },
];

function strengthTone(score) {
  if (score >= 3) return 'success';
  if (score === 2) return 'gold';
  return 'danger';
}

function hostname(item) {
  return item.website || item.url || item.title || '?';
}

function mark(item) {
  return hostname(item).replace(/^www\./, '').slice(0, 1).toUpperCase();
}

export function VaultPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('updated');
  const [selectedId, setSelectedId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [revealed, setRevealed] = useState(null);
  const hideTimer = useRef(0);

  const search = useDebounce(query, 250);
  const args = useMemo(() => ({
    q: search || undefined,
    filter,
    category: category || undefined,
    tag: tag || undefined,
    sort: filter === 'recent' ? 'used' : sort,
  }), [search, filter, category, tag, sort]);

  const { data, isLoading, error, refetch } = useGetVaultItemsQuery(args);
  const { data: metaData } = useGetVaultMetaQuery();
  const [createItem, createState] = useCreateVaultItemMutation();
  const [updateItem, updateState] = useUpdateVaultItemMutation();
  const [deleteItem, deleteState] = useDeleteVaultItemMutation();
  const [revealPassword, revealState] = useRevealVaultPasswordMutation();
  const [copyPasswordAudit] = useCopyVaultPasswordMutation();
  const resetReveal = revealState.reset;
  const [touchItem] = useTouchVaultItemMutation();
  const [favoriteItem] = useFavoriteVaultItemMutation();

  const items = data?.data?.items || [];
  const meta = metaData?.data || {};
  const selected = items.find((item) => item.id === selectedId) || items[0] || null;
  const clipboardMs = meta.clipboardClearMs || 30000;
  const hideMs = meta.revealHideMs || 8000;

  useEffect(() => {
    return subscribeToConnectivity(setOnline);
  }, []);

  useEffect(() => {
    if (selected && !items.some((item) => item.id === selectedId)) {
      setSelectedId(selected.id);
    }
  }, [items, selected, selectedId]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  function hideSecret() {
    window.clearTimeout(hideTimer.current);
    setRevealed(null);
  }

  function scheduleHide(ms) {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setRevealed(null), ms || hideMs);
  }

  async function reveal(itemId) {
    try {
      const result = await revealPassword(itemId).unwrap();
      setRevealed({ id: itemId, password: result.data?.password || '' });
      scheduleHide(result.data?.hideAfterMs);
      resetReveal();
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to unlock this password' });
    }
  }

  async function copyUsername(item) {
    if (!item.username) return;
    await copyText(item.username);
    await touchItem(item.id);
    push({ tone: 'success', title: 'Username copied', as: 'toast' });
  }

  async function copyPassword(item) {
    try {
      let secret = revealed?.id === item.id ? revealed.password : '';
      let clearMs = clipboardMs;
      if (!secret) {
        const result = await revealPassword(item.id).unwrap();
        secret = result.data?.password || '';
        clearMs = result.data?.clipboardClearMs || clipboardMs;
        setRevealed({ id: item.id, password: secret });
        scheduleHide(result.data?.hideAfterMs);
        resetReveal();
      }
      await copyAndExpire(secret, clearMs);
      copyPasswordAudit(item.id);
      push({
        tone: 'success',
        title: 'Password copied',
        message: `Clipboard clears in ${Math.round(clearMs / 1000)}s`,
        as: 'toast',
      });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Copy failed', as: 'toast' });
    }
  }

  async function handleSubmit(payload) {
    try {
      if (editing?.id) {
        await updateItem({ itemId: editing.id, ...payload }).unwrap();
        push({ tone: 'success', title: 'Entry updated' });
      } else {
        const result = await createItem(payload).unwrap();
        setSelectedId(result.data?.item?.id || '');
        push({ tone: 'success', title: 'Password stored' });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to save this entry' });
    }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      await deleteItem(selected.id).unwrap();
      hideSecret();
      setConfirmDelete(false);
      setSelectedId('');
      push({ tone: 'success', title: 'Entry deleted' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to delete' });
    }
  }

  if (error && !items.length) {
    return (
      <div className="workspace-fallback">
        <ErrorState title="Vault stayed locked" message={error?.data?.message || 'Unlock your PIN and try again.'} onRetry={refetch} />
      </div>
    );
  }

  const shownSecret = revealed && selected && revealed.id === selected.id ? revealed.password : '';

  return (
    <div className="workspace vault-workspace">
      <aside className="vault-rail">
        <div className="notes-rail-head">
          <div>
            <p className="page-kicker">Password vault</p>
            <h1 className="st-page-title" style={{ fontSize: 24, lineHeight: '32px' }}>Vault</h1>
          </div>
          <Button size="sm" icon="plus" disabled={!online} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Add
          </Button>
        </div>
        {!online ? <p className="save-pill is-offline">Offline — vault writes need a connection</p> : null}
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, username, site" />
        <div className="chip-row">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`month-chip ${filter === item.id ? 'is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="notes-filters">
          <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {VAULT_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort">
            <option value="updated">Last updated</option>
            <option value="used">Recently used</option>
            <option value="title">Name</option>
            <option value="strength">Weakest first</option>
          </Select>
        </div>
        {meta.tags?.length ? (
          <div className="chip-row">
            {meta.tags.map((item) => (
              <button
                key={item}
                type="button"
                className={`tag-chip ${tag === item ? 'is-active' : ''}`}
                onClick={() => setTag(tag === item ? '' : item)}
              >
                #{item}
              </button>
            ))}
          </div>
        ) : null}

        <div className="vault-list">
          {isLoading && !items.length ? (
            <ListSkeleton variant="card" count={5} />
          ) : !items.length ? (
            <EmptyState
              icon="lock"
              title="No passwords yet"
              message="Store a site login. The password is encrypted on the server and never sent back unless you ask."
              actionLabel="Add password"
              onAction={() => { setEditing(null); setFormOpen(true); }}
            />
          ) : items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`vault-card ${item.id === selected?.id ? 'is-active' : ''}`}
              onClick={() => { hideSecret(); setSelectedId(item.id); }}
            >
              <span className="vault-mark">{mark(item)}</span>
              <div className="vault-card-copy">
                <strong>
                  {item.title}
                  {item.favorite ? <Icon name="star" size={12} /> : null}
                </strong>
                <p>{item.username || 'No username'}</p>
                <div className="note-card-meta">
                  <Badge>{item.category}</Badge>
                  <Badge tone={strengthTone(item.strength)}>{STRENGTH_LABELS[item.strength] || 'Strength'}</Badge>
                  {item.stale ? <Badge tone="danger">Rotate</Badge> : null}
                </div>
              </div>
              <span className="muted vault-updated">{formatDateTime(item.updatedAt)}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="vault-stage">
        {!selected ? (
          <EmptyState icon="lock" title="Select an entry" message="Passwords stay hidden until you reveal them." />
        ) : (
          <>
            <header className="vault-stage-head">
              <span className="vault-mark lg">{mark(selected)}</span>
              <div>
                <p className="page-kicker">{selected.category}{selected.shared ? ' · Shared' : ''}</p>
                <h2>{selected.title}</h2>
                <p className="muted">{selected.url || selected.website || 'No website'}</p>
              </div>
              <div className="vault-actions">
                <Button size="sm" variant="ghost" icon="star" onClick={() => favoriteItem(selected.id)}>
                  {selected.favorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setEditing(selected); setFormOpen(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" icon="share" onClick={() => setShareOpen(true)}>Share</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>Delete</Button>
              </div>
            </header>

            <div className="vault-fields">
              <div className="vault-field">
                <span>Username</span>
                <strong>{selected.username || '—'}</strong>
                <Button size="sm" variant="ghost" icon="copy" disabled={!selected.username} onClick={() => copyUsername(selected)}>
                  Copy
                </Button>
              </div>
              <div className="vault-field">
                <span>Password</span>
                <strong className="vault-secret">{shownSecret || '••••••••'}</strong>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={shownSecret ? 'eyeOff' : 'eye'}
                  loading={revealState.isLoading}
                  onClick={() => (shownSecret ? hideSecret() : reveal(selected.id))}
                >
                  {shownSecret ? 'Hide' : 'Show'}
                </Button>
                <Button size="sm" variant="ghost" icon="copy" onClick={() => copyPassword(selected)}>
                  Copy
                </Button>
              </div>
              <div className="vault-field">
                <span>Website</span>
                <strong>
                  {selected.url ? (
                    <a href={selected.url.startsWith('http') ? selected.url : `https://${selected.url}`} target="_blank" rel="noreferrer">
                      {selected.url}
                    </a>
                  ) : '—'}
                </strong>
              </div>
              <div className="vault-field">
                <span>Notes</span>
                <strong>{selected.memo || '—'}</strong>
              </div>
            </div>

            <div className="vault-stats">
              <div>
                <span className="muted">Strength</span>
                <Badge tone={strengthTone(selected.strength)}>{STRENGTH_LABELS[selected.strength] || 'Unknown'}</Badge>
              </div>
              <div>
                <span className="muted">Password age</span>
                <strong>{selected.ageDays} days</strong>
              </div>
              <div>
                <span className="muted">Last updated</span>
                <strong>{formatDateTime(selected.updatedAt)}</strong>
              </div>
              <div>
                <span className="muted">Last used</span>
                <strong>{selected.lastUsedAt ? formatDateTime(selected.lastUsedAt) : 'Never'}</strong>
              </div>
            </div>
            {selected.stale ? (
              <p className="muted">This password is over 90 days old. Generate a new one and update the site.</p>
            ) : null}
            {selected.tags?.length ? (
              <div className="chip-row">
                {selected.tags.map((item) => (
                  <span key={item} className="tag-chip">#{item}</span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <VaultFormModal
        open={formOpen}
        item={editing}
        loading={createState.isLoading || updateState.isLoading}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <ShareModal
        open={shareOpen}
        resourceType="password"
        resourceId={selected?.id}
        title={selected?.title}
        onClose={() => setShareOpen(false)}
      />
      <ConfirmationDialog
        open={confirmDelete}
        title="Delete this password?"
        message="The encrypted secret is removed from your vault. This cannot be undone."
        confirmLabel="Delete"
        loading={deleteState.isLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
