import { baseApi } from '../../store/api/baseApi';
import { setUser } from '../auth/authSlice';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({ url: `/notifications/${notificationId}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({ url: `/notifications/${notificationId}`, method: 'DELETE' }),
      invalidatesTags: ['Notifications'],
    }),
    updateNotificationPrefs: builder.mutation({
      query: (body) => ({ url: '/notifications/preferences', method: 'PATCH', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data?.data?.user) dispatch(setUser(data.data.user));
      },
      invalidatesTags: ['Profile', 'Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useUpdateNotificationPrefsMutation,
} = notificationsApi;
