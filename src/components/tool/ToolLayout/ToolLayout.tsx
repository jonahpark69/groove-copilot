import type { ReactNode } from "react";
import styles from "./ToolLayout.module.scss";

type ToolLayoutProps = {
  header: ReactNode;
  main: ReactNode;
  aside: ReactNode;
};

export default function ToolLayout({ header, main, aside }: ToolLayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>{header}</header>
      <section className={styles.main}>{main}</section>
      <aside className={styles.aside}>{aside}</aside>
    </div>
  );
}
