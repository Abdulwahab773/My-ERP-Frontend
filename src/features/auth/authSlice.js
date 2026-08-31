import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? 'ready' : 'anonymous';
    },
    setAuthStatus(state, action) {
      state.status = action.payload;
    },
    resetAuth() {
      return { user: null, status: 'anonymous' };
    },
  },
});

export const { setUser, setAuthStatus, resetAuth } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export default authSlice.reducer;
