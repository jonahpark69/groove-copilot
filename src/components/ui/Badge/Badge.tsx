import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.scss";

type BadgeTone = "neutral" | "info" | "warn" | "success";

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
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {children}
    </span>
  );
}
