import { baseApi } from '../../store/api/baseApi';
import { setUser } from '../auth/authSlice';

export const securityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPinStatus: builder.query({
      query: () => '/security/pin/status',
      providesTags: ['Pin'],
    }),
    getSecurityOverview: builder.query({
      query: () => '/security/overview',
      providesTags: ['Security', 'Sessions', 'Activity', 'Pin', 'Profile'],
    }),
    getActivity: builder.query({
      query: () => '/security/activity',
      providesTags: ['Activity'],
    }),
    getSecurityActivitySummary: builder.query({
      query: () => '/security/activity/summary',
      providesTags: ['Activity', 'Audit'],
    }),
    getAuditLog: builder.query({
      query: (params = {}) => ({ url: '/security/audit', params }),
      providesTags: ['Audit'],
    }),
    createPin: builder.mutation({
      query: (body) => ({ url: '/security/pin', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.user) dispatch(setUser(data.data.user));
        } catch {
          /* surfaced by hook */
        }
      },
      invalidatesTags: ['Pin', 'Security', 'Profile', 'Dashboard'],
    }),
    unlockPin: builder.mutation({
      query: (body) => ({ url: '/security/pin/unlock', method: 'POST', body }),
      invalidatesTags: ['Pin', 'Security', 'Dashboard'],
    }),
    lockPin: builder.mutation({
      query: () => ({ url: '/security/pin/lock', method: 'POST' }),
      invalidatesTags: ['Pin', 'Security', 'Dashboard'],
    }),
    changePin: builder.mutation({
      query: (body) => ({ url: '/security/pin/change', method: 'POST', body }),
      invalidatesTags: ['Pin', 'Security', 'Activity', 'Dashboard'],
    }),
    forgotPin: builder.mutation({
      query: () => ({ url: '/security/pin/forgot', method: 'POST' }),
    }),
    verifyPinOtp: builder.mutation({
      query: (body) => ({ url: '/security/pin/otp/verify', method: 'POST', body }),
    }),
    resetPin: builder.mutation({
      query: (body) => ({ url: '/security/pin/reset', method: 'POST', body }),
      invalidatesTags: ['Pin', 'Security', 'Activity', 'Dashboard'],
    }),
    getSensitiveModule: builder.query({
      query: (moduleId) => `/sensitive/${moduleId}`,
    }),
  }),
});

export const {
  useGetPinStatusQuery,
  useGetSecurityOverviewQuery,
  useGetActivityQuery,
  useGetSecurityActivitySummaryQuery,
  useGetAuditLogQuery,
  useCreatePinMutation,
  useUnlockPinMutation,
  useLockPinMutation,
  useChangePinMutation,
  useForgotPinMutation,
  useVerifyPinOtpMutation,
  useResetPinMutation,
  useGetSensitiveModuleQuery,
} = securityApi;
