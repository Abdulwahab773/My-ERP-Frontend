import { API_BASE_URL } from '../../store/api/baseApi';
import { GoogleMark } from './GoogleMark';

export function GoogleButton({
  enabled = true,
  loading = false,
  offline = false,
  label = 'Continue with Google Workspace',
}) {
  function start() {
    const startUrl = API_BASE_URL.startsWith('http')
      ? `${API_BASE_URL}/auth/google`
      : `${window.location.protocol}//${window.location.hostname}:5000/api/v1/auth/google`;
    window.location.assign(startUrl);
  }

  const text = loading
    ? 'Checking Google…'
    : offline
      ? 'API is offline — start the server'
      : enabled
        ? label
        : 'Google sign-in is not configured';

  return (
    <button
      type="button"
      onClick={start}
      disabled={loading || offline || !enabled}
      className="w-full flex items-center justify-center gap-sm px-md py-sm bg-surface border border-outline-variant rounded-lg hover:bg-surface-container-low active:bg-surface-container-high transition-colors duration-200 mb-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
    >
      <GoogleMark />
      <span className="font-label-md text-label-md text-on-surface">{text}</span>
    </button>
  );
}
