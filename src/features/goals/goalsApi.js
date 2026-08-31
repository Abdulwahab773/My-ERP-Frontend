import { baseApi } from '../../store/api/baseApi';

export const goalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoals: builder.query({
      query: (params = {}) => ({ url: '/goals', params }),
      providesTags: ['Goals'],
    }),
    createGoal: builder.mutation({
      query: (body) => ({ url: '/goals', method: 'POST', body }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
    updateGoal: builder.mutation({
      query: ({ goalId, ...body }) => ({ url: `/goals/${goalId}`, method: 'PATCH', body }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
    deleteGoal: builder.mutation({
      query: (goalId) => ({ url: `/goals/${goalId}`, method: 'DELETE' }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
    pauseGoal: builder.mutation({
      query: (goalId) => ({ url: `/goals/${goalId}/pause`, method: 'POST' }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
    resumeGoal: builder.mutation({
      query: (goalId) => ({ url: `/goals/${goalId}/resume`, method: 'POST' }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
    completeGoal: builder.mutation({
      query: (goalId) => ({ url: `/goals/${goalId}/complete`, method: 'POST' }),
      invalidatesTags: ['Goals', 'Dashboard'],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  usePauseGoalMutation,
  useResumeGoalMutation,
  useCompleteGoalMutation,
} = goalsApi;
