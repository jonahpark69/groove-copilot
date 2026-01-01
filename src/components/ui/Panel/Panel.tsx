import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Panel.module.scss";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Panel({
  title,
  subtitle,
  children,
  className,
  ...rest
}: PanelProps) {
  const classes = [styles.panel, className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...rest}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
