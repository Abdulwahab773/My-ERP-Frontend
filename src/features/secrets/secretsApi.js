import { baseApi } from '../../store/api/baseApi';

export const secretsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnvCollections: builder.query({
      query: (params = {}) => ({ url: '/secrets', params }),
      providesTags: (result) => [
        { type: 'Secrets', id: 'LIST' },
        ...((result?.data?.collections || []).map((item) => ({ type: 'Secrets', id: item.id }))),
      ],
    }),
    getEnvMeta: builder.query({
      query: () => '/secrets/meta',
      providesTags: [{ type: 'Secrets', id: 'META' }],
    }),
    getEnvCollection: builder.query({
      query: (collectionId) => `/secrets/${collectionId}`,
      providesTags: (_result, _error, id) => [{ type: 'Secrets', id }],
    }),
    previewEnvFile: builder.mutation({
      query: (body) => ({ url: '/secrets/preview', method: 'POST', body }),
    }),
    createEnvCollection: builder.mutation({
      query: (body) => ({ url: '/secrets', method: 'POST', body }),
      invalidatesTags: ['Secrets', 'Dashboard'],
    }),
    updateEnvCollection: builder.mutation({
      query: ({ collectionId, ...body }) => ({ url: `/secrets/${collectionId}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Secrets', id: arg.collectionId }, { type: 'Secrets', id: 'LIST' }, 'Dashboard'],
    }),
    deleteEnvCollection: builder.mutation({
      query: (collectionId) => ({ url: `/secrets/${collectionId}`, method: 'DELETE' }),
      invalidatesTags: ['Secrets', 'Dashboard'],
    }),
    favoriteEnvCollection: builder.mutation({
      query: (collectionId) => ({ url: `/secrets/${collectionId}/favorite`, method: 'POST' }),
      invalidatesTags: ['Secrets'],
    }),
    addEnvVariable: builder.mutation({
      query: ({ collectionId, ...body }) => ({ url: `/secrets/${collectionId}/variables`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Secrets', id: arg.collectionId }, { type: 'Secrets', id: 'LIST' }],
    }),
    updateEnvVariable: builder.mutation({
      query: ({ variableId, ...body }) => ({ url: `/secrets/variables/${variableId}`, method: 'PATCH', body }),
      invalidatesTags: ['Secrets'],
    }),
    deleteEnvVariable: builder.mutation({
      query: (variableId) => ({ url: `/secrets/variables/${variableId}`, method: 'DELETE' }),
      invalidatesTags: ['Secrets'],
    }),
    revealEnvVariable: builder.mutation({
      query: (variableId) => ({ url: `/secrets/variables/${variableId}/reveal`, method: 'POST' }),
    }),
    copyEnvVariable: builder.mutation({
      query: (variableId) => ({ url: `/secrets/variables/${variableId}/copy`, method: 'POST' }),
    }),
    duplicateEnvVariable: builder.mutation({
      query: (variableId) => ({ url: `/secrets/variables/${variableId}/duplicate`, method: 'POST' }),
      invalidatesTags: ['Secrets'],
    }),
    importEnvVariables: builder.mutation({
      query: ({ collectionId, ...body }) => ({ url: `/secrets/${collectionId}/import`, method: 'POST', body }),
      invalidatesTags: ['Secrets'],
    }),
    exportEnvCollection: builder.mutation({
      query: (collectionId) => ({ url: `/secrets/${collectionId}/export`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetEnvCollectionsQuery,
  useGetEnvMetaQuery,
  useGetEnvCollectionQuery,
  usePreviewEnvFileMutation,
  useCreateEnvCollectionMutation,
  useUpdateEnvCollectionMutation,
  useDeleteEnvCollectionMutation,
  useFavoriteEnvCollectionMutation,
  useAddEnvVariableMutation,
  useUpdateEnvVariableMutation,
  useDeleteEnvVariableMutation,
  useRevealEnvVariableMutation,
  useCopyEnvVariableMutation,
  useDuplicateEnvVariableMutation,
  useImportEnvVariablesMutation,
  useExportEnvCollectionMutation,
} = secretsApi;
