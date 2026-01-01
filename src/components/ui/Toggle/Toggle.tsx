import { useId } from "react";
import styles from "./Toggle.module.scss";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
};

export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: ToggleProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label className={styles.toggle} htmlFor={inputId}>
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.switch}>
        <input
          id={inputId}
          className={styles.input}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-label={label ?? "Toggle"}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
    </label>
  );
}
