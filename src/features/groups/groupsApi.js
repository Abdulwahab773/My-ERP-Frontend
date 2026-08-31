import { baseApi } from '../../store/api/baseApi';

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => '/groups',
      providesTags: ['Groups'],
    }),
    createGroup: builder.mutation({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['Groups'],
    }),
    updateGroup: builder.mutation({
      query: ({ groupId, ...body }) => ({ url: `/groups/${groupId}`, method: 'PATCH', body }),
      invalidatesTags: ['Groups'],
    }),
    deleteGroup: builder.mutation({
      query: (groupId) => ({ url: `/groups/${groupId}`, method: 'DELETE' }),
      invalidatesTags: ['Groups', 'Shares'],
    }),
    addGroupMember: builder.mutation({
      query: ({ groupId, ...body }) => ({ url: `/groups/${groupId}/members`, method: 'POST', body }),
      invalidatesTags: ['Groups'],
    }),
    updateGroupMember: builder.mutation({
      query: ({ groupId, userId, ...body }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Groups'],
    }),
    removeGroupMember: builder.mutation({
      query: ({ groupId, userId }) => ({ url: `/groups/${groupId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Groups'],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useAddGroupMemberMutation,
  useUpdateGroupMemberMutation,
  useRemoveGroupMemberMutation,
} = groupsApi;
