import { baseApi } from '../../store/api/baseApi';
import { isNetworkError, isOnline } from '../../pwa/offline';
import { enqueueMutation } from '../../pwa/sync';
import { makeOperationId } from '../../pwa/ids';
import { addConflict, isConflictError, conflictPayload } from '../../pwa/conflicts';
import {
  filterFinance,
  makeOfflineFinance,
  mergeFinanceCache,
  readFinanceCache,
  removeFinanceRecord,
  upsertFinanceRecord,
  isOfflineId,
} from './financeCache';

const moneyTags = ['Income', 'Expenses', 'Debts', 'Categories', 'Dashboard', 'Reports'];

function userIdOf(api) {
  return api.getState().auth.user?.id;
}

function financeEnvelope(items, message, extra = {}) {
  return { success: true, message, data: { items }, meta: extra };
}

async function cachedFinance(api, kind, params) {
  const rows = filterFinance(await readFinanceCache(userIdOf(api), kind), params);
  return financeEnvelope(rows, 'Loaded offline', { offline: true });
}

function conflictError(error, module, recordId) {
  if (isConflictError(error)) {
    const payload = conflictPayload(error);
    addConflict({
      module,
      recordId,
      message: error.data?.message || error.message,
      server: payload.server,
      client: payload.client,
    });
  }
  return { error };
}

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMonths: builder.query({
      query: () => '/finance/months',
      providesTags: ['Reports', 'Income', 'Expenses'],
    }),
    getMonthBook: builder.query({
      query: (month) => `/finance/months/${month}`,
      providesTags: ['Reports', 'Income', 'Expenses', 'Debts', 'Goals'],
    }),
    closeMonth: builder.mutation({
      query: (month) => ({ url: `/finance/months/${month}/close`, method: 'POST' }),
      invalidatesTags: moneyTags,
    }),
    reopenMonth: builder.mutation({
      query: ({ month, ...body }) => ({ url: `/finance/months/${month}/reopen`, method: 'POST', body }),
      invalidatesTags: moneyTags,
    }),
    getFinanceOverview: builder.query({
      query: (month) => ({ url: '/finance/overview', params: month ? { month } : undefined }),
      providesTags: moneyTags,
    }),
    getFinanceAnalytics: builder.query({
      query: (month) => ({ url: '/finance/analytics', params: month ? { month } : undefined }),
      providesTags: ['Reports', 'Income', 'Expenses'],
    }),
    getFinanceBalance: builder.query({
      query: () => '/finance/balance',
      providesTags: moneyTags,
    }),
    getLedger: builder.query({
      query: (params = {}) => ({ url: '/finance/ledger', params }),
      providesTags: moneyTags,
    }),
    getIncome: builder.query({
      async queryFn(params = {}, api, _extra, baseQuery) {
        const result = await baseQuery({ url: '/finance/income', params });
        if (result.data) {
          await mergeFinanceCache(userIdOf(api), 'income', result.data.data?.items || []);
          return { data: result.data };
        }
        if (!isOnline() || isNetworkError(result.error)) {
          return { data: await cachedFinance(api, 'income', params) };
        }
        return { error: result.error };
      },
      providesTags: ['Income'],
    }),
    createIncomeRecord: builder.mutation({
      async queryFn(body, api, _extra, baseQuery) {
        return mutateFinance(api, baseQuery, {
          kind: 'income',
          module: 'income',
          type: 'create',
          url: '/finance/income',
          method: 'POST',
          body,
        });
      },
      invalidatesTags: moneyTags,
    }),
    updateIncomeRecord: builder.mutation({
      async queryFn({ incomeId, ...body }, api, _extra, baseQuery) {
        return mutateFinance(api, baseQuery, {
          kind: 'income',
          module: 'income',
          type: 'update',
          url: `/finance/income/${incomeId}`,
          method: 'PATCH',
          body,
          recordId: incomeId,
        });
      },
      invalidatesTags: moneyTags,
    }),
    deleteIncomeRecord: builder.mutation({
      query: (incomeId) => ({ url: `/finance/income/${incomeId}`, method: 'DELETE' }),
      invalidatesTags: moneyTags,
    }),
    getExpenses: builder.query({
      async queryFn(params = {}, api, _extra, baseQuery) {
        const result = await baseQuery({ url: '/finance/expenses', params });
        if (result.data) {
          await mergeFinanceCache(userIdOf(api), 'expenses', result.data.data?.items || []);
          return { data: result.data };
        }
        if (!isOnline() || isNetworkError(result.error)) {
          return { data: await cachedFinance(api, 'expenses', params) };
        }
        return { error: result.error };
      },
      providesTags: ['Expenses'],
    }),
    createExpenseRecord: builder.mutation({
      async queryFn(body, api, _extra, baseQuery) {
        return mutateFinance(api, baseQuery, {
          kind: 'expenses',
          module: 'expenses',
          type: 'create',
          url: '/finance/expenses',
          method: 'POST',
          body,
        });
      },
      invalidatesTags: moneyTags,
    }),
    updateExpenseRecord: builder.mutation({
      async queryFn({ expenseId, ...body }, api, _extra, baseQuery) {
        return mutateFinance(api, baseQuery, {
          kind: 'expenses',
          module: 'expenses',
          type: 'update',
          url: `/finance/expenses/${expenseId}`,
          method: 'PATCH',
          body,
          recordId: expenseId,
        });
      },
      invalidatesTags: moneyTags,
    }),
    deleteExpenseRecord: builder.mutation({
      query: (expenseId) => ({ url: `/finance/expenses/${expenseId}`, method: 'DELETE' }),
      invalidatesTags: moneyTags,
    }),
    getCategories: builder.query({
      query: (params = {}) => ({ url: '/finance/categories', params }),
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/finance/categories', method: 'POST', body }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, ...body }) => ({ url: `/finance/categories/${categoryId}`, method: 'PATCH', body }),
      invalidatesTags: ['Categories', 'Income', 'Expenses', 'Dashboard'],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({ url: `/finance/categories/${categoryId}`, method: 'DELETE' }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

async function mutateFinance(api, baseQuery, { kind, module, type, url, method, body, recordId }) {
  const userId = userIdOf(api);
  const idempotencyKey = body.idempotencyKey || makeOperationId();
  const payload = {
    ...body,
    idempotencyKey,
    ...(type === 'update' && body.baseVersion == null && recordId && !isOfflineId(recordId)
      ? {}
      : {}),
  };

  if (type === 'update' && recordId && !isOfflineId(recordId)) {
    const cached = (await readFinanceCache(userId, kind)).find((row) => row.id === recordId);
    if (cached?.version && payload.baseVersion == null) payload.baseVersion = cached.version;
  }

  if (!(type === 'create' && (!recordId || isOfflineId(recordId))) && recordId && isOfflineId(recordId) && isOnline() && type === 'update') {
    const created = await baseQuery({ url: kind === 'income' ? '/finance/income' : '/finance/expenses', method: 'POST', body: payload });
    if (created.data?.data?.item) {
      await removeFinanceRecord(userId, kind, recordId);
      await upsertFinanceRecord(userId, kind, created.data.data.item);
      return { data: created.data };
    }
  }

  if (!recordId || !isOfflineId(recordId)) {
    const result = await baseQuery({ url, method, body: payload });
    if (result.data) {
      if (result.data.data?.item) await upsertFinanceRecord(userId, kind, result.data.data.item);
      return { data: result.data };
    }
    if (isOnline() && !isNetworkError(result.error)) {
      return conflictError(result.error, module, recordId);
    }
  }

  const current = recordId
    ? (await readFinanceCache(userId, kind)).find((row) => row.id === recordId)
    : null;
  const item = type === 'create'
    ? makeOfflineFinance(kind, payload)
    : { ...current, ...payload, id: recordId, updatedAt: new Date().toISOString(), offline: true };
  await upsertFinanceRecord(userId, kind, item);
  await enqueueMutation({
    module,
    type: type === 'update' && isOfflineId(item.id) ? 'create' : type,
    tempId: isOfflineId(item.id) ? item.id : undefined,
    recordId: item.id,
    operationId: idempotencyKey,
    body: payload,
  });
  return {
    data: {
      success: true,
      message: 'Saved offline',
      data: { item },
      meta: { offline: true },
    },
  };
}

export const {
  useGetMonthsQuery,
  useGetMonthBookQuery,
  useCloseMonthMutation,
  useReopenMonthMutation,
  useGetFinanceOverviewQuery,
  useGetFinanceAnalyticsQuery,
  useGetFinanceBalanceQuery,
  useGetLedgerQuery,
  useGetIncomeQuery,
  useCreateIncomeRecordMutation,
  useUpdateIncomeRecordMutation,
  useDeleteIncomeRecordMutation,
  useGetExpensesQuery,
  useCreateExpenseRecordMutation,
  useUpdateExpenseRecordMutation,
  useDeleteExpenseRecordMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = financeApi;
