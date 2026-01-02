"use client";

import { useState } from "react";
import { Badge, Button, IconButton, Panel, Slider, Tabs, Toggle } from "@/components/ui";

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "arrangement", label: "Arrangement" },
  { id: "mix", label: "Mix", disabled: true },
];

export default function UiKitPage() {
  const [activeTab, setActiveTab] = useState(tabItems[0].id);
  const [enabled, setEnabled] = useState(true);
  const [bpm, setBpm] = useState(140);
  const [swing, setSwing] = useState(24);

  return (
    <main className="gp-container">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <p
            className="gp-muted"
            style={{ margin: 0, fontSize: "13px", letterSpacing: "0.08em" }}
          >
            UI KIT
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: "32px" }}>
            Groove Copilot - Components
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="info">J3</Badge>
          <Badge tone="neutral">React + SCSS</Badge>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <Panel title="Buttons" subtitle="Primary, ghost, loading, disabled">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button>Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Panel>

        <Panel title="Icon Buttons" subtitle="Hover + focus visible">
          <div style={{ display: "flex", gap: 12 }}>
            <IconButton label="Play">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </IconButton>
            <IconButton label="Settings" variant="subtle">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm8.4 3.2-.9-.5.1-1.1-1.6-2.8-1 .3-.8-.7.3-1-2.8-1.6-1.1.1-.5-.9H9.7l-.5.9-1.1-.1-2.8 1.6.3 1-.8.7-1-.3-1.6 2.8.1 1.1-.9.5v3.2l.9.5-.1 1.1 1.6 2.8 1-.3.8.7-.3 1 2.8 1.6 1.1-.1.5.9h3.2l.5-.9 1.1.1 2.8-1.6-.3-1 .8-.7 1 .3 1.6-2.8-.1-1.1.9-.5v-3.2zm-8.4 5.6a5.6 5.6 0 1 1 0-11.2 5.6 5.6 0 0 1 0 11.2z" />
              </svg>
            </IconButton>
            <IconButton label="Disabled" disabled>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5 12h14v2H5z" />
              </svg>
            </IconButton>
          </div>
        </Panel>

        <Panel title="Tabs" subtitle="Active and disabled">
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
          <div
            role="tabpanel"
            id={`tabs-panel-${activeTab}`}
            aria-labelledby={`tabs-${activeTab}`}
            style={{ marginTop: 16 }}
          >
            <p className="gp-muted" style={{ margin: 0 }}>
              Active tab: <strong style={{ color: "var(--fg)" }}>{activeTab}</strong>
            </p>
          </div>
        </Panel>

        <Panel title="Toggles" subtitle="Interactive switch">
          <div style={{ display: "grid", gap: 14 }}>
            <Toggle label="Groove coach" checked={enabled} onChange={setEnabled} />
            <Toggle
              label="Offline mode"
              checked={!enabled}
              onChange={(value) => setEnabled(!value)}
            />
            <Toggle
              label="Disabled toggle"
              checked
              onChange={() => undefined}
              disabled
            />
          </div>
        </Panel>

        <Panel title="Sliders" subtitle="Value display">
          <div style={{ display: "grid", gap: 18 }}>
            <Slider
              label="Tempo"
              value={bpm}
              min={80}
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
