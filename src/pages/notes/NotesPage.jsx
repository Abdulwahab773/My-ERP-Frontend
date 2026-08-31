import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  ListSkeleton,
  Select,
} from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { NoteEditor } from '../../components/notes/NoteEditor';
import { NOTE_CATEGORIES } from '../../constants';
import { selectUser } from '../../features/auth/authSlice';
import {
  useArchiveNoteMutation,
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useFavoriteNoteMutation,
  useGetNotesMetaQuery,
  useGetNotesQuery,
  usePinNoteMutation,
  useRestoreNoteMutation,
  useUpdateNoteMutation,
} from '../../features/notes/notesApi';
import { clearDraft, readDraft, saveDraft } from '../../features/notes/notesCache';
import { useDebounce } from '../../hooks/useDebounce';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { flushQueue } from '../../pwa/sync';
import { isOnline, subscribeToConnectivity } from '../../pwa/offline';
import { formatDateTime } from '../../utils/format';
import { countWords, parseTags } from '../../utils/htmlText';
import { ShareModal } from '../../components/sharing/ShareModal';

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'archived', label: 'Archived' },
];

function saveLabel(status) {
  return {
    saving: 'Saving…',
    saved: 'Saved',
    offline: 'Saved offline',
    syncing: 'Syncing…',
  }[status] || 'Saved';
}

export function NotesPage() {
  const user = useSelector(selectUser);
  const { push } = useToast();
  const compact = useMediaQuery('(max-width: 900px)');
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('n');

  const [query, setQuery] = useState(params.get('q') || '');
  const [filter, setFilter] = useState('active');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('updated');
  const [tagDraft, setTagDraft] = useState('');
  const [status, setStatus] = useState('saved');
  const [online, setOnline] = useState(isOnline());
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [working, setWorking] = useState(null);

  const search = useDebounce(query, 250);
  const snapshot = useRef('');

  const listArgs = useMemo(() => ({
    q: search || undefined,
    filter,
    category: category || undefined,
    tag: tag || undefined,
    sort,
  }), [search, filter, category, tag, sort]);

  const { data, isLoading, error, refetch } = useGetNotesQuery(listArgs);
  const { data: metaData } = useGetNotesMetaQuery();
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote, deleteState] = useDeleteNoteMutation();
  const [archiveNote] = useArchiveNoteMutation();
  const [restoreNote] = useRestoreNoteMutation();
  const [pinNote] = usePinNoteMutation();
  const [favoriteNote] = useFavoriteNoteMutation();

  const notes = data?.data?.notes || [];
  const meta = metaData?.data || {};
  const selected = notes.find((note) => note.id === selectedId) || null;

  useEffect(() => {
    return subscribeToConnectivity(async (next) => {
      setOnline(next);
      if (next && user?.id) {
        setStatus('syncing');
        await flushQueue(user.id);
        await refetch();
        setStatus('saved');
      } else if (!next) {
        setStatus('offline');
      }
    });
  }, [refetch, user?.id]);

  useEffect(() => {
    if (!online) setStatus('offline');
  }, [online]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!selected) {
        setWorking(null);
        snapshot.current = '';
        return;
      }
      const draft = user?.id ? await readDraft(user.id, selected.id) : null;
      const next = draft && new Date(draft.updatedAt) > new Date(selected.updatedAt)
        ? { ...selected, ...draft }
        : selected;
      if (cancelled) return;
      setWorking(next);
      setTagDraft((next.tags || []).join(', '));
      snapshot.current = JSON.stringify({
        title: next.title,
        body: next.body,
        category: next.category,
        tags: next.tags || [],
      });
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [selected?.id, user?.id]);

  const persist = useCallback(async (next) => {
    const payload = {
      title: next.title,
      body: next.body,
      category: next.category,
      tags: next.tags || [],
    };
    const key = JSON.stringify(payload);
    if (key === snapshot.current) return;
    setStatus(isOnline() ? 'saving' : 'offline');
    try {
      const result = await updateNote({ noteId: next.id, ...payload }).unwrap();
      const saved = result.data?.note;
      snapshot.current = key;
      if (user?.id) await clearDraft(user.id, next.id);
      if (saved?.id && saved.id !== next.id) {
        setWorking(saved);
        const nextParams = new URLSearchParams(params);
        nextParams.set('n', saved.id);
        setParams(nextParams, { replace: true });
      }
      setStatus(isOnline() ? 'saved' : 'offline');
    } catch (err) {
      setStatus(isOnline() ? 'saved' : 'offline');
      push({ tone: 'danger', title: err?.data?.message || 'Note could not save', as: 'toast' });
    }
  }, [params, push, setParams, updateNote, user?.id]);

  useEffect(() => {
    if (!working) return undefined;
    if (user?.id) {
      saveDraft(user.id, working.id, {
        title: working.title,
        body: working.body,
        category: working.category,
        tags: working.tags,
      });
    }
    const timer = window.setTimeout(() => persist(working), 800);
    return () => window.clearTimeout(timer);
  }, [working, persist, user?.id]);

  function selectNote(id) {
    const next = new URLSearchParams(params);
    if (id) next.set('n', id);
    else next.delete('n');
    setParams(next, { replace: true });
  }

  const handleCreate = useCallback(async () => {
    try {
      const result = await createNote({ title: 'Untitled', body: '', category: category || 'Personal' }).unwrap();
      const note = result.data?.note;
      if (note) {
        const next = new URLSearchParams(params);
        next.set('n', note.id);
        setParams(next, { replace: true });
      }
      push({ tone: 'success', title: result.meta?.offline ? 'Created offline' : 'Note created' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to create note' });
    }
  }, [category, createNote, params, push, setParams]);

  async function handleDelete() {
    if (!selectedId) return;
    try {
      await deleteNote(selectedId).unwrap();
      setConfirmDelete(false);
      selectNote('');
      push({ tone: 'success', title: 'Note deleted' });
    } catch (err) {
      push({ tone: 'danger', title: err?.data?.message || 'Unable to delete note' });
    }
  }

  useEffect(() => {
    function onKey(event) {
      const meta = event.metaKey || event.ctrlKey;
      const target = event.target;
      const typing = target?.matches?.('input, textarea, [contenteditable="true"]');

      if (meta && event.key.toLowerCase() === 'n' && !event.shiftKey) {
        event.preventDefault();
        handleCreate();
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (working) persist(working);
      }
      if (meta && event.shiftKey && event.key.toLowerCase() === 'a' && selectedId) {
        event.preventDefault();
        if (working?.archived) restoreNote(selectedId);
        else archiveNote(selectedId);
      }
      if (meta && event.shiftKey && event.key.toLowerCase() === 'p' && selectedId) {
        event.preventDefault();
        pinNote(selectedId);
      }
      if (event.key === '/' && !typing) {
        event.preventDefault();
        document.getElementById('notes-search')?.querySelector('input')?.focus();
      }
      if (event.key === '?' && !typing) {
        setShortcuts(true);
      }
      if (event.key === 'Escape' && compact && selectedId) {
        selectNote('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [archiveNote, compact, handleCreate, persist, pinNote, restoreNote, selectedId, working]);

  const counts = countWords(working?.body || '');
  const showList = !compact || !selectedId;
  const showEditor = !compact || Boolean(selectedId);

  if (error && !notes.length) {
    return (
      <div className="workspace-fallback">
        <ErrorState title="Notes could not load" message={error?.data?.message || 'Try again.'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={`workspace notes-workspace ${compact && selectedId ? 'is-editor' : compact ? 'is-list' : ''}`}>
      {showList ? (
        <aside className="notes-rail">
          <div className="notes-search" id="notes-search">
            <MsIcon name="search" />
            <input
              placeholder="Search notes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
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
          <div className="notes-cats">
            {NOTE_CATEGORIES.slice(0, 2).map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'is-active' : ''}
                onClick={() => setCategory(category === item ? '' : item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="notes-list">
            {isLoading && !notes.length ? <ListSkeleton variant="note" count={5} /> : null}
            {!isLoading && !notes.length ? (
              <div className="notes-empty-rail">
                <EmptyState
                  icon="note"
                  title={search ? 'Nothing matches' : 'Your notebook is empty'}
                  message={search ? 'Try another word, tag, or category.' : 'Capture a thought. It stays on your account only.'}
                  actionLabel="Create a note"
                  onAction={handleCreate}
                />
              </div>
            ) : null}
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={`note-card ${note.id === selectedId ? 'is-active' : ''}`}
                onClick={() => selectNote(note.id)}
              >
                <div className="note-card-top">
                  <strong>
                    {note.pinned ? <MsIcon name="push_pin" className="text-[16px]" /> : null}
                    {note.title || 'Untitled'}
                  </strong>
                  <span className="muted">{formatDateTime(note.updatedAt)}</span>
                </div>
                <p>{note.preview || 'Empty note'}</p>
                <div className="note-card-meta">
                  <span className="tag-chip">{note.category}</span>
                  <MsIcon name={status === 'syncing' ? 'sync' : 'cloud_done'} className="text-[14px]" />
                </div>
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      {showEditor ? (
        <section className="notes-stage">
          {!working ? (
            <div className="notes-stage-empty">
              <EmptyState
                icon="note"
                title="Choose a note"
                message="Select one from the list or start a blank page."
                actionLabel="New note"
                onAction={handleCreate}
              />
            </div>
          ) : (
            <>
              <header className="notes-stage-bar">
                {compact ? (
                  <button type="button" className="notes-action" onClick={() => selectNote('')} aria-label="Back to list">
                    <MsIcon name="arrow_back" />
                  </button>
                ) : null}
                <span className={`save-pill ${status === 'saved' ? 'is-saved' : ''} ${status === 'saving' || status === 'syncing' ? 'is-saving' : ''} ${status === 'offline' ? 'is-offline' : ''}`}>
                  <MsIcon name="cloud_done" className="text-[16px]" /> {saveLabel(status)}
                </span>
                <div className="notes-stage-bar" style={{ marginLeft: 'auto' }}>
                  <button type="button" className={`notes-action ${working.pinned ? 'is-on' : ''}`} onClick={() => pinNote(working.id)} title="Pin" aria-label="Pin">
                    <MsIcon name="push_pin" filled={working.pinned} />
                  </button>
                  <button type="button" className={`notes-action ${working.favorite ? 'is-on' : ''}`} onClick={() => favoriteNote(working.id)} title="Favorite" aria-label="Favorite">
                    <MsIcon name="star" filled={working.favorite} />
                  </button>
                  <button type="button" className="notes-action" onClick={() => (working.archived ? restoreNote(working.id) : archiveNote(working.id))} title="Archive" aria-label="Archive">
                    <MsIcon name="archive" />
                  </button>
                  {!working.offline && !String(working.id).startsWith('offline-') ? (
                    <button type="button" className="notes-action" onClick={() => setShareOpen(true)} title="Share" aria-label="Share">
                      <MsIcon name="share" />
                    </button>
                  ) : null}
                  {!working.shared ? (
                    <button type="button" className="notes-action" onClick={() => setConfirmDelete(true)} title="Delete" aria-label="Delete">
                      <MsIcon name="delete" />
                    </button>
                  ) : null}
                </div>
              </header>
              <div className="notes-editor">
                <div className="chip-row" style={{ marginBottom: 16 }}>
                  <span className="notes-folder">
                    <MsIcon name="folder" className="text-[14px]" /> {working.category}
                  </span>
                  {(working.tags || []).map((item) => (
                    <span key={item} className="tag-chip">{item}</span>
                  ))}
                </div>
                <input
                  className="notes-title"
                  value={working.title}
                  onChange={(event) => setWorking((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Untitled"
                  maxLength={140}
                />
                <div className="notes-meta-row">
                  <Select value={working.category} onChange={(event) => setWorking((current) => ({ ...current, category: event.target.value }))} aria-label="Category">
                    {NOTE_CATEGORIES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                  <input
                    className="st-input"
                    value={tagDraft}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTagDraft(value);
                      setWorking((current) => ({ ...current, tags: parseTags(value) }));
                    }}
                    placeholder="Tags, comma separated"
                  />
                </div>
                <NoteEditor
                  noteId={working.id}
                  body={working.body}
                  onChange={(html) => setWorking((current) => ({ ...current, body: html }))}
                />
                <p className="notes-foot">{counts.words} words · {counts.characters} characters</p>
              </div>
            </>
          )}
        </section>
      ) : null}

      <button type="button" className="notes-fab" onClick={handleCreate} aria-label="New note">
        <MsIcon name="edit" />
      </button>

      <ShareModal
        open={shareOpen}
        resourceType="note"
        resourceId={working?.id}
        title={working?.title}
        onClose={() => setShareOpen(false)}
      />

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete this note?"
        message="This permanently removes the note from your account."
        confirmLabel="Delete"
        loading={deleteState.isLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />

      {shortcuts ? (
        <div className="overlay" onClick={() => setShortcuts(false)} role="presentation">
          <div className="dialog dialog-sm" onClick={(event) => event.stopPropagation()}>
            <header className="dialog-header">
              <h2>Keyboard shortcuts</h2>
              <button type="button" className="p-2" onClick={() => setShortcuts(false)} aria-label="Close">
                <MsIcon name="close" />
              </button>
            </header>
            <div className="dialog-body shortcut-list">
              <p><kbd>Ctrl</kbd> <kbd>N</kbd> New note</p>
              <p><kbd>Ctrl</kbd> <kbd>S</kbd> Save now</p>
              <p><kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>P</kbd> Pin</p>
              <p><kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>A</kbd> Archive / restore</p>
              <p><kbd>/</kbd> Focus search</p>
              <p><kbd>?</kbd> This list</p>
              <p><kbd>Esc</kbd> Back to list on mobile</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
