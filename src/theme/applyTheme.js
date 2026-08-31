import { STORAGE_KEYS } from '../constants';
import { storage } from '../utils/storage';

export function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(mode) {
  const resolved = resolveTheme(mode);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.classList.toggle('light', resolved === 'light');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#121218' : '#fcf8ff');
  }

  storage.set(STORAGE_KEYS.THEME, mode);
  return resolved;
}

export function readStoredTheme() {
  const stored = storage.get(STORAGE_KEYS.THEME, 'system');
  return ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
}
