import { useDispatch, useSelector } from 'react-redux';
import { setThemeMode } from '../features/theme/themeSlice';

export function useTheme() {
  const dispatch = useDispatch();
  const { mode, resolved } = useSelector((state) => state.theme);

  return {
    mode,
    resolved,
    setMode: (next) => dispatch(setThemeMode(next)),
  };
}
