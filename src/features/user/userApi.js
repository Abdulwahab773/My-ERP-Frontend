import { baseApi } from '../../store/api/baseApi';
import { setAuthStatus, setUser } from '../auth/authSlice';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile', 'Session'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(setAuthStatus('loading'));
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data.user));
        } catch {
          dispatch(setUser(null));
        }
      },
    }),
    updateMe: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data.data.user));
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = userApi;
