"use client";

import { useState } from "react";
import { Badge, Button, IconButton, Panel, Slider, Tabs, Toggle } from "@/components/ui";
import styles from "./page.module.scss";

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "arrangement", label: "Arrangement" },
  { id: "mix", label: "Mix", disabled: true },
];

export default function UiPage() {
  const [activeTab, setActiveTab] = useState(tabItems[0].id);
  const [enabled, setEnabled] = useState(true);
  const [bpm, setBpm] = useState(128);
  const [swing, setSwing] = useState(24);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>UI KIT</p>
          <h1 className={styles.title}>Groove Copilot UI</h1>
          <p className={styles.subtitle}>
            Minimal premium components. Focus, hover, and spacing are tuned for a clean
            production feel.
          </p>
        </div>
        <div className={styles.badges}>
          <Badge tone="info">J3</Badge>
          <Badge tone="neutral">SCSS Modules</Badge>
          <Badge tone="success">Ready</Badge>
        </div>
      </header>

      <section className={styles.grid}>
        <Panel title="Buttons" subtitle="Primary, ghost, subtle, loading">
          <div className={styles.row}>
            <Button leftIcon={<span className={styles.icon}>+</span>}>Primary</Button>
            <Button variant="ghost" rightIcon={<span className={styles.icon}>{"<"}</span>}>
              Ghost
            </Button>
            <Button variant="subtle">Subtle</Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Panel>

        <Panel title="Icon Buttons" subtitle="Ghost + subtle variants">
          <div className={styles.row}>
            <IconButton label="Play">
              <span className={styles.icon}>{">"}</span>
            </IconButton>
            <IconButton label="Star" variant="subtle">
              <span className={styles.icon}>*</span>
            </IconButton>
            <IconButton label="Disabled" disabled>
              <span className={styles.icon}>x</span>
            </IconButton>
          </div>
        </Panel>

        <Panel title="Badges" subtitle="Neutral, info, warn, success">
          <div className={styles.row}>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="warn">Warn</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </Panel>

        <Panel title="Tabs" subtitle="Controlled navigation">
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
          <div
            role="tabpanel"
            id={`tabs-panel-${activeTab}`}
            aria-labelledby={`tabs-${activeTab}`}
            className={styles.tabsHint}
          >
            Active tab: <strong>{activeTab}</strong>
          </div>
        </Panel>

        <Panel title="Toggles" subtitle="Accessible switch control">
          <div className={styles.stack}>
            <Toggle label="Groove coach" checked={enabled} onChange={setEnabled} />
            <Toggle
              label="Offline mode"
              checked={!enabled}
              onChange={(value) => setEnabled(!value)}
            />
            <Toggle label="Disabled" checked onChange={() => undefined} disabled />
          </div>
        </Panel>

        <Panel title="Sliders" subtitle="Value + hint">
          <div className={styles.stack}>
            <Slider
              label="Tempo"
              value={bpm}
              min={60}
              max={180}
              step={1}
              onChange={setBpm}
              hint="BPM"
            />
            <Slider
              label="Swing"
              value={swing}
              min={0}
              max={60}
              step={1}
              onChange={setSwing}
              hint="Percent"
            />
            <Slider
              label="Density"
              value={48}
              min={0}
              max={100}
              step={5}
              onChange={() => undefined}
              hint="Percent"
              disabled
            />
          </div>
        </Panel>
      </section>
    </main>
  );
}
