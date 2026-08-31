import { scorePassword, STRENGTH_LABELS } from '../../utils/passwordStrength';

export function PasswordStrength({ password }) {
  const score = password ? scorePassword(password) : 0;
  const label = password ? STRENGTH_LABELS[score] : 'Use 8+ characters with upper, lower, and a number';

  return (
    <div className="strength" aria-live="polite">
      <div className="strength-track">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={`strength-bar ${score >= step ? `is-${score}` : ''}`} />
        ))}
      </div>
      <p>{label}</p>
    </div>
  );
}
