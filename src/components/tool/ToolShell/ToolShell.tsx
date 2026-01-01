import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ToolShell.module.scss";

type ToolShellProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export default function ToolShell({
  title,
  description,
  rightSlot,
  children,
  className,
  ...rest
}: ToolShellProps) {
  const classes = [styles.shell, className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...rest}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {rightSlot && <div className={styles.right}>{rightSlot}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
