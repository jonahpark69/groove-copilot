import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./IconButton.module.scss";

type IconButtonVariant = "ghost" | "subtle";
type IconButtonSize = "sm" | "md";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
};

export default function IconButton({
  label,
  variant = "ghost",
  size = "md",
  children,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], className)}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}
