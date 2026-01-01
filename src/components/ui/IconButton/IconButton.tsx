import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.scss";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel: string;
  children: ReactNode;
};

export default function IconButton({
  ariaLabel,
  children,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}
