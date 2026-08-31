import { Loader } from './Loader';

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="aether-loader-block" role="status" aria-live="polite">
      <Loader size="lg" />
      <p>{label}</p>
    </div>
  );
}
