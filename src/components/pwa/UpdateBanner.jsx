import { Button } from '../ui';

export function UpdateBanner({ update, onReload }) {
  if (!update) return null;
  return (
    <div className="update-banner">
      <span>A new version of Aether is ready.</span>
      <Button size="sm" onClick={onReload}>Refresh</Button>
    </div>
  );
}
