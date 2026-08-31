import { baseApi } from '../../store/api/baseApi';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: () => '/reports',
      providesTags: ['Reports'],
    }),
    generateReport: builder.mutation({
      query: (body) => ({ url: '/reports/generate', method: 'POST', body }),
      invalidatesTags: ['Reports'],
    }),
    emailReport: builder.mutation({
      query: (reportId) => ({ url: `/reports/${reportId}/email`, method: 'POST' }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGenerateReportMutation,
  useEmailReportMutation,
} = reportsApi;
