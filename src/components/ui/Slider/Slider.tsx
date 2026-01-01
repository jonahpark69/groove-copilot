import { useId } from "react";
import styles from "./Slider.module.scss";

type SliderProps = {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
};

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  disabled = false,
}: SliderProps) {
  const autoId = useId();
  const inputId = `slider-${autoId}`;
  const valueLabel = unit ? `${value} ${unit}` : `${value}`;

  return (
    <div className={styles.slider}>
      {(label || valueLabel) && (
        <div className={styles.header}>
          {label && (
            <label className={styles.label} htmlFor={inputId}>
              {label}
            </label>
          )}
          <span className={styles.value}>{valueLabel}</span>
        </div>
      )}
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
