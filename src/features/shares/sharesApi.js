import { baseApi } from '../../store/api/baseApi';

export const sharesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInboxShares: builder.query({
      query: () => '/shares/inbox',
      providesTags: ['Shares'],
    }),
    getOutgoingShares: builder.query({
      query: (params = {}) => ({ url: '/shares/outgoing', params }),
      providesTags: ['Shares'],
    }),
    createShare: builder.mutation({
      query: (body) => ({ url: '/shares', method: 'POST', body }),
      invalidatesTags: ['Shares', 'Notes', 'Passwords', 'Secrets', 'Notifications'],
    }),
    updateShare: builder.mutation({
      query: ({ shareId, ...body }) => ({ url: `/shares/${shareId}`, method: 'PATCH', body }),
      invalidatesTags: ['Shares'],
    }),
    revokeShare: builder.mutation({
      query: (shareId) => ({ url: `/shares/${shareId}/revoke`, method: 'POST' }),
      invalidatesTags: ['Shares', 'Notes', 'Passwords', 'Secrets'],
    }),
  }),
});

export const {
  useGetInboxSharesQuery,
  useGetOutgoingSharesQuery,
  useCreateShareMutation,
  useUpdateShareMutation,
  useRevokeShareMutation,
} = sharesApi;
