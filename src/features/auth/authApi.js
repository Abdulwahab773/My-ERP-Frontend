import { baseApi } from '../../store/api/baseApi';
import { resetAuth, setUser } from './authSlice';

function applyUser(dispatch, queryFulfilled) {
  return queryFulfilled.then(({ data }) => {
    if (data?.data?.user) {
      dispatch(setUser(data.data.user));
    }
  });
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthConfig: builder.query({
      query: () => '/auth/config',
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyUser(dispatch, queryFulfilled);
        } catch {
          /* surfaced by the mutation hook */
        }
      },
      invalidatesTags: ['Session', 'Profile'],
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyUser(dispatch, queryFulfilled);
        } catch {
          /* surfaced by the mutation hook */
        }
      },
      invalidatesTags: ['Session', 'Profile'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(resetAuth());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    logoutAll: builder.mutation({
      query: (body = {}) => ({ url: '/auth/logout-all', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          if (arg?.everywhere) {
            dispatch(resetAuth());
            dispatch(baseApi.util.resetApiState());
          }
        } catch {
          /* surfaced by the mutation hook */
        }
      },
      invalidatesTags: ['Sessions', 'Pin', 'Security', 'Activity'],
    }),
    refresh: builder.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyUser(dispatch, queryFulfilled);
        } catch {
          /* surfaced by the mutation hook */
        }
      },
    }),
    completeGoogle: builder.mutation({
      query: (body) => ({ url: '/auth/google/complete', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await applyUser(dispatch, queryFulfilled);
        } catch {
          /* surfaced by the mutation hook */
        }
      },
      invalidatesTags: ['Session', 'Profile'],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
    resendVerification: builder.mutation({
      query: () => ({ url: '/auth/resend-verification', method: 'POST' }),
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
      invalidatesTags: ['Sessions', 'Profile'],
    }),
    getSessions: builder.query({
      query: () => '/auth/sessions',
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation({
      query: (sessionId) => ({ url: `/auth/sessions/${sessionId}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useGetAuthConfigQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshMutation,
  useCompleteGoogleMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useChangePasswordMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
} = authApi;
