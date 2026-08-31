import { baseApi } from '../../store/api/baseApi';

const tags = ['Debts', 'Income', 'Expenses', 'Dashboard', 'Reports'];

export const debtsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDebtSummary: builder.query({
      query: () => '/debts/summary',
      providesTags: ['Debts'],
    }),
    getDebts: builder.query({
      query: (params = {}) => ({ url: '/debts', params }),
      providesTags: (result) => [
        { type: 'Debts', id: 'LIST' },
        ...((result?.data?.items || []).map((item) => ({ type: 'Debts', id: item.id }))),
      ],
    }),
    getDebt: builder.query({
      query: (debtId) => `/debts/${debtId}`,
      providesTags: (_r, _e, id) => [{ type: 'Debts', id }],
    }),
    createDebtRecord: builder.mutation({
      query: (body) => ({ url: '/debts', method: 'POST', body }),
      invalidatesTags: tags,
    }),
    updateDebtRecord: builder.mutation({
      query: ({ debtId, ...body }) => ({ url: `/debts/${debtId}`, method: 'PATCH', body }),
      invalidatesTags: tags,
    }),
    deleteDebtRecord: builder.mutation({
      query: (debtId) => ({ url: `/debts/${debtId}`, method: 'DELETE' }),
      invalidatesTags: tags,
    }),
    repayDebt: builder.mutation({
      query: ({ debtId, ...body }) => ({ url: `/debts/${debtId}/repay`, method: 'POST', body }),
      invalidatesTags: tags,
    }),
    getPeople: builder.query({
      query: () => '/debts/people',
      providesTags: ['Debts'],
    }),
    createPerson: builder.mutation({
      query: (body) => ({ url: '/debts/people', method: 'POST', body }),
      invalidatesTags: ['Debts'],
    }),
  }),
});

export const {
  useGetDebtSummaryQuery,
  useGetDebtsQuery,
  useGetDebtQuery,
  useCreateDebtRecordMutation,
  useUpdateDebtRecordMutation,
  useDeleteDebtRecordMutation,
  useRepayDebtMutation,
  useGetPeopleQuery,
  useCreatePersonMutation,
} = debtsApi;
