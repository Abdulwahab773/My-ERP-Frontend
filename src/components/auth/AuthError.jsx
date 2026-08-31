import { MsIcon } from '../ui/MsIcon';

export function AuthError({ title = 'Authentication Failed', children }) {
  if (!children) return null;
  return (
    <div className="bg-error-container border border-error/20 rounded-lg p-sm mb-lg flex items-start gap-sm shadow-sm" role="alert">
      <MsIcon name="error" filled className="text-on-error-container text-[20px] mt-0.5" />
      <div>
        <h3 className="font-label-md text-label-md text-on-error-container">{title}</h3>
        <p className="font-body-sm text-body-sm text-on-error-container mt-0.5 opacity-90">{children}</p>
      </div>
    </div>
  );
}
