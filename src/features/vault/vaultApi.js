import { baseApi } from '../../store/api/baseApi';

export const vaultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVaultItems: builder.query({
      query: (params = {}) => ({ url: '/vault', params }),
      providesTags: (result) => [
        { type: 'Passwords', id: 'LIST' },
        ...((result?.data?.items || []).map((item) => ({ type: 'Passwords', id: item.id }))),
      ],
    }),
    getVaultMeta: builder.query({
      query: () => '/vault/meta',
      providesTags: [{ type: 'Passwords', id: 'META' }],
    }),
    getVaultItem: builder.query({
      query: (itemId) => `/vault/${itemId}`,
      providesTags: (_result, _error, itemId) => [{ type: 'Passwords', id: itemId }],
    }),
    createVaultItem: builder.mutation({
      query: (body) => ({ url: '/vault', method: 'POST', body }),
      invalidatesTags: ['Passwords', 'Dashboard'],
    }),
    updateVaultItem: builder.mutation({
      query: ({ itemId, ...body }) => ({ url: `/vault/${itemId}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Passwords', id: arg.itemId },
        { type: 'Passwords', id: 'LIST' },
        { type: 'Passwords', id: 'META' },
        'Dashboard',
      ],
    }),
    deleteVaultItem: builder.mutation({
      query: (itemId) => ({ url: `/vault/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Passwords', 'Dashboard'],
    }),
    revealVaultPassword: builder.mutation({
      query: (itemId) => ({ url: `/vault/${itemId}/reveal`, method: 'POST' }),
      invalidatesTags: (_result, _error, itemId) => [{ type: 'Passwords', id: itemId }, { type: 'Passwords', id: 'LIST' }],
    }),
    copyVaultPassword: builder.mutation({
      query: (itemId) => ({ url: `/vault/${itemId}/copy`, method: 'POST' }),
    }),
    touchVaultItem: builder.mutation({
      query: (itemId) => ({ url: `/vault/${itemId}/touch`, method: 'POST' }),
      invalidatesTags: (_result, _error, itemId) => [{ type: 'Passwords', id: itemId }, { type: 'Passwords', id: 'LIST' }],
    }),
    favoriteVaultItem: builder.mutation({
      query: (itemId) => ({ url: `/vault/${itemId}/favorite`, method: 'POST' }),
      invalidatesTags: ['Passwords'],
    }),
  }),
});

export const {
  useGetVaultItemsQuery,
  useGetVaultMetaQuery,
  useGetVaultItemQuery,
  useCreateVaultItemMutation,
  useUpdateVaultItemMutation,
  useDeleteVaultItemMutation,
  useRevealVaultPasswordMutation,
  useCopyVaultPasswordMutation,
  useTouchVaultItemMutation,
  useFavoriteVaultItemMutation,
} = vaultApi;
