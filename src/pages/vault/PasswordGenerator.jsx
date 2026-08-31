import { Checkbox, Input } from '../../components/ui';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { generatePassword } from '../../utils/generatePassword';

export function PasswordGenerator({ value, onChange, options, setOptions }) {
  function update(name, next) {
    const merged = { ...options, [name]: next };
    setOptions(merged);
    onChange(generatePassword(merged));
  }

  return (
    <div className="generator">
      <div className="generator-head">
        <strong>Password generator</strong>
        <button type="button" className="text-link" onClick={() => onChange(generatePassword(options))}>
          Generate
        </button>
      </div>
      <Input
        label="Length"
        type="range"
        min="8"
        max="64"
        value={options.length}
        onChange={(event) => update('length', Number(event.target.value))}
        hint={`${options.length} characters`}
      />
      <div className="generator-grid">
        <Checkbox label="Uppercase" checked={options.uppercase} onChange={(event) => update('uppercase', event.target.checked)} />
        <Checkbox label="Lowercase" checked={options.lowercase} onChange={(event) => update('lowercase', event.target.checked)} />
        <Checkbox label="Numbers" checked={options.numbers} onChange={(event) => update('numbers', event.target.checked)} />
        <Checkbox label="Symbols" checked={options.symbols} onChange={(event) => update('symbols', event.target.checked)} />
        <Checkbox
          label="Exclude ambiguous (0 O 1 l I)"
          checked={options.excludeAmbiguous}
          onChange={(event) => update('excludeAmbiguous', event.target.checked)}
        />
      </div>
      <PasswordStrength password={value} />
    </div>
  );
}
