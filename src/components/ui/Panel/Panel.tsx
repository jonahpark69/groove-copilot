import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Panel.module.scss";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export default function Panel({
  title,
  subtitle,
  right,
  children,
  className,
  ...rest
}: PanelProps) {
  return (
    <section className={cx(styles.panel, className)} {...rest}>
      {(title || subtitle || right) && (
        <header className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {right && <div className={styles.right}>{right}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
