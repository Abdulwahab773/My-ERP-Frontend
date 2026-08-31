import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { resetAuth } from '../../features/auth/authSlice';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders(headers) {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

function isAuthRefresh(args) {
  const url = typeof args === 'string' ? args : args?.url;
  return typeof url === 'string' && url.includes('/auth/refresh');
}

async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isAuthRefresh(args)) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(resetAuth());
    }
  }

  return result;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Session',
    'Profile',
    'Notes',
    'Passwords',
    'Secrets',
    'Expenses',
    'Income',
    'Debts',
    'Goals',
    'Categories',
    'Reports',
    'Audit',
    'Sessions',
    'Pin',
    'Security',
    'Activity',
    'Dashboard',
    'Shares',
    'Groups',
    'Notifications',
  ],
  endpoints: () => ({}),
});
