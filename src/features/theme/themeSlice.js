import { createSlice } from '@reduxjs/toolkit';
import { applyTheme, readStoredTheme, resolveTheme } from '../../theme/applyTheme';

const mode = readStoredTheme();

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode,
    resolved: resolveTheme(mode),
  },
  reducers: {
    setThemeMode(state, action) {
      state.mode = action.payload;
      state.resolved = applyTheme(action.payload);
    },
    syncSystemTheme(state) {
      if (state.mode === 'system') {
        state.resolved = applyTheme('system');
      }
    },
  },
});

export const { setThemeMode, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
