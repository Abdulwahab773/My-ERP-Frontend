export function AuthDivider({ label = 'or' }) {
  return (
    <div className="auth-divider">
      <span>{label}</span>
    </div>
  );
}
