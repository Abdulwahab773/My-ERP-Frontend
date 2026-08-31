import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import '../features/auth/authApi';
import '../features/user/userApi';
import '../features/security/securityApi';
import '../features/dashboard/dashboardApi';
import '../features/notes/notesApi';
import '../features/vault/vaultApi';
import '../features/secrets/secretsApi';
import '../features/finance/financeApi';
import '../features/debts/debtsApi';
import '../features/goals/goalsApi';
import '../features/reports/reportsApi';
import '../features/shares/sharesApi';
import '../features/groups/groupsApi';
import '../features/notifications/notificationsApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});
