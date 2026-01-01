import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.scss";

type BadgeTone = "neutral" | "accent";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export default function Badge({
  tone = "neutral",
  children,
  className,
  ...rest
}: BadgeProps) {
  const classes = [styles.badge, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
