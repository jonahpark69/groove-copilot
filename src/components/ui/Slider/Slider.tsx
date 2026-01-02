import { useId } from "react";
import styles from "./Slider.module.scss";

type SliderProps = {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  hint?: string;
  disabled?: boolean;
};

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
  disabled = false,
}: SliderProps) {
  const autoId = useId();
  const inputId = `slider-${autoId}`;

  return (
    <div className={styles.slider}>
      <div className={styles.header}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <span className={styles.value}>{value}</span>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      <input
        id={inputId}
        className={styles.input}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        aria-label={label ?? "Slider"}
      />
    </div>
  );
}
