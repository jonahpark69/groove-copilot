import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={isDisabled} {...rest}>
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
