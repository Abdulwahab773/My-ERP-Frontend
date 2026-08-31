import { baseApi } from '../../store/api/baseApi';
import { isNetworkError, isOnline } from '../../pwa/offline';
import { enqueueMutation } from '../../pwa/sync';
import { makeOperationId } from '../../pwa/ids';
import { addConflict, isConflictError, conflictPayload } from '../../pwa/conflicts';
import {
  applyDraftsToNotes,
  clearDraft,
  filterCachedNotes,
  findCachedNote,
  isOfflineId,
  makeOfflineNote,
  mergeNoteCache,
  readDrafts,
  readNoteCache,
  removeCachedNote,
  replaceCachedId,
  upsertCachedNote,
} from './notesCache';

function userIdOf(api) {
  return api.getState().auth.user?.id;
}

function envelope(notes, message = 'Notes loaded', extra = {}) {
  return { success: true, message, data: { notes }, meta: extra };
}

async function cachedList(api, params) {
  const userId = userIdOf(api);
  const notes = applyDraftsToNotes(await readNoteCache(userId), await readDrafts(userId));
  return envelope(filterCachedNotes(notes, params), 'Notes loaded offline', { offline: true });
}

export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query({
      async queryFn(params = {}, api, _extra, baseQuery) {
        const result = await baseQuery({ url: '/notes', params });
        if (result.data) {
          const userId = userIdOf(api);
          await mergeNoteCache(userId, result.data.data?.notes || []);
          const drafts = await readDrafts(userId);
          return {
            data: {
              ...result.data,
              data: { notes: applyDraftsToNotes(result.data.data?.notes || [], drafts) },
            },
          };
        }
        if (!isOnline() || isNetworkError(result.error)) {
          return { data: await cachedList(api, params) };
        }
        return { error: result.error };
      },
      providesTags: (result) => [
        { type: 'Notes', id: 'LIST' },
        ...((result?.data?.notes || []).map((note) => ({ type: 'Notes', id: note.id }))),
      ],
    }),
    getNotesMeta: builder.query({
      async queryFn(_arg, api, _extra, baseQuery) {
        const result = await baseQuery('/notes/meta');
        if (result.data) return { data: result.data };
        const notes = await readNoteCache(userIdOf(api));
        const tags = new Set();
        const categories = new Set();
        notes.forEach((note) => {
          if (note.category) categories.add(note.category);
          (note.tags || []).forEach((tag) => tags.add(tag));
        });
        return {
          data: {
            success: true,
            data: { categories: [...categories].sort(), tags: [...tags].sort(), total: notes.length },
          },
        };
      },
      providesTags: [{ type: 'Notes', id: 'META' }],
    }),
    getNote: builder.query({
      async queryFn(noteId, api, _extra, baseQuery) {
        const userId = userIdOf(api);
        if (isOfflineId(noteId)) {
          const note = await findCachedNote(userId, noteId);
          if (!note) return { error: { status: 404, data: { message: 'Note not found' } } };
          return { data: { success: true, data: { note } } };
        }
        const result = await baseQuery(`/notes/${noteId}`);
        if (result.data) {
          await upsertCachedNote(userId, result.data.data?.note);
          return { data: result.data };
        }
        const cached = await findCachedNote(userId, noteId);
        if (cached) return { data: { success: true, data: { note: cached }, meta: { offline: true } } };
        return { error: result.error };
      },
      providesTags: (_result, _error, noteId) => [{ type: 'Notes', id: noteId }],
    }),
    createNote: builder.mutation({
      async queryFn(body, api, _extra, baseQuery) {
        const result = await baseQuery({ url: '/notes', method: 'POST', body });
        if (result.data) {
          await upsertCachedNote(userIdOf(api), result.data.data?.note);
          return { data: result.data };
        }
        if (!isOnline() || isNetworkError(result.error)) {
          const note = makeOfflineNote(body);
          const idempotencyKey = body.idempotencyKey || makeOperationId();
          await upsertCachedNote(userIdOf(api), note);
          await enqueueMutation({
            module: 'notes',
            type: 'create',
            tempId: note.id,
            recordId: note.id,
            operationId: idempotencyKey,
            body: {
              title: note.title,
              body: note.body,
              category: note.category,
              tags: note.tags,
              pinned: note.pinned,
              favorite: note.favorite,
              idempotencyKey,
            },
          });
          return { data: { success: true, message: 'Saved offline', data: { note }, meta: { offline: true } } };
        }
        return { error: result.error };
      },
      invalidatesTags: ['Notes', 'Dashboard'],
    }),
    updateNote: builder.mutation({
      async queryFn({ noteId, ...body }, api, _extra, baseQuery) {
        const userId = userIdOf(api);
        const applyLocal = async (note) => {
          await upsertCachedNote(userId, note);
          await clearDraft(userId, noteId);
          return note;
        };

        if (isOfflineId(noteId) && isOnline()) {
          const created = await baseQuery({ url: '/notes', method: 'POST', body });
          if (created.data?.data?.note) {
            await replaceCachedId(userId, noteId, created.data.data.note);
            await clearDraft(userId, noteId);
            return { data: created.data };
          }
        }

        if (!isOfflineId(noteId)) {
          const current = await findCachedNote(userId, noteId);
          const payload = {
            ...body,
            baseVersion: body.baseVersion ?? current?.version,
          };
          const result = await baseQuery({ url: `/notes/${noteId}`, method: 'PATCH', body: payload });
          if (result.data) {
            await applyLocal(result.data.data?.note);
            return { data: result.data };
          }
          if (isOnline() && !isNetworkError(result.error)) {
            if (isConflictError(result.error)) {
              const conflict = conflictPayload(result.error);
              await addConflict({
                module: 'notes',
                recordId: noteId,
                message: result.error.data?.message,
                server: conflict.server,
                client: conflict.client || payload,
              });
            }
            return { error: result.error };
          }
        }

        const current = (await findCachedNote(userId, noteId)) || makeOfflineNote({ ...body, title: body.title });
        const note = { ...current, ...body, id: noteId, updatedAt: new Date().toISOString() };
        await applyLocal(note);
        const idempotencyKey = body.idempotencyKey || makeOperationId();
        await enqueueMutation({
          module: 'notes',
          type: isOfflineId(noteId) ? 'create' : 'update',
          noteId,
          recordId: noteId,
          tempId: isOfflineId(noteId) ? noteId : undefined,
          operationId: idempotencyKey,
          body: {
            title: note.title,
            body: note.body,
            category: note.category,
            tags: note.tags,
            pinned: note.pinned,
            favorite: note.favorite,
            idempotencyKey,
            baseVersion: note.version,
          },
        });
        return { data: { success: true, message: 'Saved offline', data: { note }, meta: { offline: true } } };
      },
      invalidatesTags: (_result, _error, arg) => [{ type: 'Notes', id: arg.noteId }, { type: 'Notes', id: 'LIST' }, 'Dashboard'],
    }),
    deleteNote: builder.mutation({
      async queryFn(noteId, api, _extra, baseQuery) {
        if (!isOfflineId(noteId)) {
          const result = await baseQuery({ url: `/notes/${noteId}`, method: 'DELETE' });
          if (!result.error) {
            await removeCachedNote(userIdOf(api), noteId);
            await clearDraft(userIdOf(api), noteId);
            return { data: result.data || { success: true } };
          }
          if (isOnline() && !isNetworkError(result.error)) return { error: result.error };
        }
        await removeCachedNote(userIdOf(api), noteId);
        await clearDraft(userIdOf(api), noteId);
        if (!isOfflineId(noteId)) {
          await enqueueMutation({ module: 'notes', type: 'delete', noteId });
        }
        return { data: { success: true, meta: { offline: true } } };
      },
      invalidatesTags: ['Notes', 'Dashboard'],
    }),
    archiveNote: builder.mutation({
      async queryFn(noteId, api, _extra, baseQuery) {
        return flagAction(api, baseQuery, noteId, 'archive', { archived: true, archivedAt: new Date().toISOString() });
      },
      invalidatesTags: ['Notes', 'Dashboard'],
    }),
    restoreNote: builder.mutation({
      async queryFn(noteId, api, _extra, baseQuery) {
        return flagAction(api, baseQuery, noteId, 'restore', { archived: false, archivedAt: null });
      },
      invalidatesTags: ['Notes', 'Dashboard'],
    }),
    pinNote: builder.mutation({
      async queryFn(noteId, api, _extra, baseQuery) {
        return toggleAction(api, baseQuery, noteId, 'pin', 'pinned');
      },
      invalidatesTags: ['Notes'],
    }),
    favoriteNote: builder.mutation({
      async queryFn(noteId, api, _extra, baseQuery) {
        return toggleAction(api, baseQuery, noteId, 'favorite', 'favorite');
      },
      invalidatesTags: ['Notes'],
    }),
  }),
});

async function flagAction(api, baseQuery, noteId, action, patch) {
  const userId = userIdOf(api);
  if (!isOfflineId(noteId)) {
    const result = await baseQuery({ url: `/notes/${noteId}/${action}`, method: 'POST' });
    if (result.data) {
      await upsertCachedNote(userId, result.data.data?.note);
      return { data: result.data };
    }
    if (isOnline() && !isNetworkError(result.error)) return { error: result.error };
  }
  const current = await findCachedNote(userId, noteId);
  if (!current) return { error: { status: 404, data: { message: 'Note not found' } } };
  const note = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await upsertCachedNote(userId, note);
  await enqueueMutation({ module: 'notes', type: action, noteId });
  return { data: { success: true, data: { note }, meta: { offline: true } } };
}

async function toggleAction(api, baseQuery, noteId, action, field) {
  const userId = userIdOf(api);
  if (!isOfflineId(noteId)) {
    const result = await baseQuery({ url: `/notes/${noteId}/${action}`, method: 'POST' });
    if (result.data) {
      await upsertCachedNote(userId, result.data.data?.note);
      return { data: result.data };
    }
    if (isOnline() && !isNetworkError(result.error)) return { error: result.error };
  }
  const current = await findCachedNote(userId, noteId);
  if (!current) return { error: { status: 404, data: { message: 'Note not found' } } };
  const note = { ...current, [field]: !current[field], updatedAt: new Date().toISOString() };
  await upsertCachedNote(userId, note);
  await enqueueMutation({ module: 'notes', type: action, noteId });
  return { data: { success: true, data: { note }, meta: { offline: true } } };
}

export const {
  useGetNotesQuery,
  useGetNotesMetaQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useArchiveNoteMutation,
  useRestoreNoteMutation,
  usePinNoteMutation,
  useFavoriteNoteMutation,
} = notesApi;
