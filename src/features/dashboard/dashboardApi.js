import { baseApi } from '../../store/api/baseApi';

const dashboardTags = ['Dashboard', 'Income', 'Expenses', 'Debts', 'Goals', 'Notes', 'Passwords', 'Secrets'];

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: (month) => ({ url: '/dashboard', params: month ? { month } : undefined }),
      providesTags: ['Dashboard'],
    }),
    createIncome: builder.mutation({
      query: (body) => ({ url: '/dashboard/income', method: 'POST', body }),
      invalidatesTags: dashboardTags,
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/dashboard/expenses', method: 'POST', body }),
      invalidatesTags: dashboardTags,
    }),
    createDebt: builder.mutation({
      query: (body) => ({ url: '/dashboard/debts', method: 'POST', body }),
      invalidatesTags: dashboardTags,
    }),
    upsertGoal: builder.mutation({
      query: (body) => ({ url: '/dashboard/goals', method: 'POST', body }),
      invalidatesTags: ['Dashboard', 'Goals'],
    }),
    createNote: builder.mutation({
      query: (body) => ({ url: '/dashboard/notes', method: 'POST', body }),
      invalidatesTags: ['Dashboard', 'Notes'],
    }),
    createPassword: builder.mutation({
      query: (body) => ({ url: '/dashboard/passwords', method: 'POST', body }),
      invalidatesTags: ['Dashboard', 'Passwords'],
    }),
    createSecret: builder.mutation({
      query: (body) => ({ url: '/dashboard/secrets', method: 'POST', body }),
      invalidatesTags: ['Dashboard', 'Secrets'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useCreateIncomeMutation,
  useCreateExpenseMutation,
  useCreateDebtMutation,
  useUpsertGoalMutation,
  useCreateNoteMutation,
  useCreatePasswordMutation,
  useCreateSecretMutation,
} = dashboardApi;
