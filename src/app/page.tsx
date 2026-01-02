"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Panel } from "@/components/ui";
import styles from "./page.module.scss";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span>Groove Copilot</span>
          <Badge tone="neutral">POC</Badge>
        </div>
        <div className={styles.nav}>
          <Button size="sm" variant="ghost" onClick={() => router.push("/app")}>
            App
          </Button>
          <Button size="sm" variant="ghost" onClick={() => router.push("/ui")}>
            UI Kit
          </Button>
        </div>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>AI GROOVE DESIGNER</p>
        <h1 className={styles.title}>Groove Copilot</h1>
        <p className={styles.tagline}>
          Genere un pattern coherent selon ton style et ton BPM, ecoute-le
          instantanement, puis suis le coach pour savoir quoi ajouter.
        </p>
        <div className={styles.ctaRow}>
          <Button onClick={() => router.push("/app")}>Open App</Button>
          <Button variant="ghost" onClick={() => router.push("/ui")}>
            UI Kit
          </Button>
        </div>
      </section>

      <section className={styles.panels}>
        <Panel title="Coach" subtitle="Guidage clair, actionnable">
          <ul className={styles.bullets}>
            <li>Structure par sections + bars.</li>
            <li>Instruments core vs optionnels.</li>
            <li>Mix tips courts et utiles.</li>
          </ul>
        </Panel>
        <Panel title="Sequencer" subtitle="Pattern control minimal">
          <ul className={styles.bullets}>
            <li>Grille lisible avec accents visuels.</li>
            <li>Quick actions: clear, random, humanize.</li>
            <li>Etat persiste en localStorage.</li>
          </ul>
        </Panel>
        <Panel title="Variants" subtitle="Repro et iteration rapide">
          <ul className={styles.bullets}>
            <li>5 variantes deterministes.</li>
            <li>Seed copy/paste pour reproduire.</li>
            <li>Apply instant sur la grille.</li>
          </ul>
        </Panel>
      </section>

      <footer className={styles.footer}>
        Prototype Jour 10 - Next.js, TypeScript, SCSS Modules.
      </footer>
    </main>
  );
}
