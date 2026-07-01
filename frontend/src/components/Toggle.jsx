export default function Toggle({ checked, onChange, disabled, label, id }) {
  return (
    <label className={`toggle ${disabled ? 'disabled' : ''}`} htmlFor={id}>
      {label && <span className="toggle-label">{label}</span>}
      <input
        id={id}
        type="checkbox"
        className="toggle-input"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </label>
  )
}
