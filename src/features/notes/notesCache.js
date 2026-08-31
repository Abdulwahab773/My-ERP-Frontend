import { STORAGE_KEYS } from '../../constants';
import { idbGet, idbSet } from '../../pwa/idb';
import { countWords } from '../../utils/htmlText';

function cacheKey(userId) {
  return `${STORAGE_KEYS.NOTES_CACHE}.${userId}`;
}

function draftKey(userId) {
  return `${STORAGE_KEYS.NOTES_DRAFTS}.${userId}`;
}

export function isOfflineId(id) {
  return String(id || '').startsWith('offline-');
}

export function makeOfflineNote(payload = {}) {
  const body = payload.body || '';
  const counts = countWords(body);
  const now = new Date().toISOString();
  return {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title?.trim() || 'Untitled',
    body,
    preview: counts.preview,
    category: payload.category || 'Personal',
    tags: payload.tags || [],
    pinned: Boolean(payload.pinned),
    favorite: Boolean(payload.favorite),
    archived: false,
    archivedAt: null,
    wordCount: counts.words,
    characterCount: counts.characters,
    createdAt: now,
    updatedAt: now,
    offline: true,
  };
}

export async function readNoteCache(userId) {
  if (!userId) return [];
  return (await idbGet(cacheKey(userId))) || [];
}

export async function writeNoteCache(userId, notes) {
  if (!userId) return;
  await idbSet(cacheKey(userId), notes);
}

export async function mergeNoteCache(userId, incoming) {
  if (!userId) return incoming;
  const current = await readNoteCache(userId);
  const byId = new Map(current.map((note) => [note.id, note]));
  incoming.forEach((note) => byId.set(note.id, note));
  const next = [...byId.values()];
  await writeNoteCache(userId, next);
  return next;
}

export async function upsertCachedNote(userId, note) {
  if (!userId || !note?.id) return note;
  const current = await readNoteCache(userId);
  const next = [note, ...current.filter((item) => item.id !== note.id)];
  await writeNoteCache(userId, next);
  return note;
}

export async function removeCachedNote(userId, noteId) {
  if (!userId) return;
  const current = await readNoteCache(userId);
  await writeNoteCache(userId, current.filter((item) => item.id !== noteId));
}

export async function findCachedNote(userId, noteId) {
  const notes = await readNoteCache(userId);
  return notes.find((note) => note.id === noteId) || null;
}

export async function replaceCachedId(userId, tempId, note) {
  if (!userId) return;
  const current = await readNoteCache(userId);
  const next = current.map((item) => (item.id === tempId ? note : item));
  if (!next.some((item) => item.id === note.id)) next.unshift(note);
  await writeNoteCache(userId, next);
}

export async function readDrafts(userId) {
  if (!userId) return {};
  return (await idbGet(draftKey(userId))) || {};
}

export async function readDraft(userId, noteId) {
  const drafts = await readDrafts(userId);
  return drafts[noteId] || null;
}

export async function saveDraft(userId, noteId, draft) {
  if (!userId || !noteId) return;
  const drafts = await readDrafts(userId);
  drafts[noteId] = { ...draft, updatedAt: new Date().toISOString() };
  await idbSet(draftKey(userId), drafts);
}

export async function clearDraft(userId, noteId) {
  if (!userId || !noteId) return;
  const drafts = await readDrafts(userId);
  delete drafts[noteId];
  await idbSet(draftKey(userId), drafts);
}

export function filterCachedNotes(notes, query = {}) {
  const view = query.filter || 'active';
  const term = String(query.q || '').trim().toLowerCase();

  return notes
    .filter((note) => {
      if (view === 'archived') return note.archived;
      if (view === 'pinned') return !note.archived && note.pinned;
      if (view === 'favorites') return !note.archived && note.favorite;
      if (view !== 'all') return !note.archived;
      return true;
    })
    .filter((note) => !query.category || note.category === query.category)
    .filter((note) => !query.tag || (note.tags || []).includes(String(query.tag).toLowerCase()))
    .filter((note) => {
      if (!term) return true;
      return (
        note.title?.toLowerCase().includes(term)
        || note.body?.toLowerCase().includes(term)
        || (note.tags || []).some((tag) => tag.includes(term))
      );
    })
    .sort((left, right) => {
      if (Boolean(right.pinned) !== Boolean(left.pinned)) return right.pinned ? 1 : -1;
      if (query.sort === 'title') return (left.title || '').localeCompare(right.title || '');
      if (query.sort === 'created') return new Date(right.createdAt) - new Date(left.createdAt);
      return new Date(right.updatedAt) - new Date(left.updatedAt);
    });
}

export function applyDraftsToNotes(notes, drafts = {}) {
  return notes.map((note) => {
    const draft = drafts[note.id];
    if (!draft) return note;
    if (new Date(draft.updatedAt) <= new Date(note.updatedAt)) return note;
    const counts = countWords(draft.body ?? note.body);
    return {
      ...note,
      ...draft,
      preview: counts.preview,
      wordCount: counts.words,
      characterCount: counts.characters,
    };
  });
}
