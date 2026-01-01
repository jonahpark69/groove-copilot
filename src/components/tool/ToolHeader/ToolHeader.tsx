"use client";

import { useState } from "react";
import { Badge, Button, IconButton } from "@/components/ui";
import { clampBpm, getStylePresetById, getStylePresets } from "@/features/engine/presets";
import type { StyleId } from "@/features/engine/types";
import styles from "./ToolHeader.module.scss";

export default function ToolHeader() {
  const presets = getStylePresets();
  const [styleId, setStyleId] = useState<StyleId>("trap");
  const [bpm, setBpm] = useState(
    () => getStylePresetById("trap").bpmRange.default
  );
  const preset = getStylePresetById(styleId);
  const subtitle = `${preset.name} • ${preset.bpmRange.min}-${preset.bpmRange.max} bpm • ${preset.tracks.length} tracks`;

  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <div>
          <p className={styles.kicker}>Groove Copilot</p>
          <h1 className={styles.title}>Layout Tool</h1>
          <p className={styles.kicker}>{subtitle}</p>
        </div>
        <Badge tone="neutral">POC</Badge>
      </div>

      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="style-select">
            Style
          </label>
          <select
            id="style-select"
            className={styles.select}
            value={styleId}
            onChange={(event) => {
              const nextId = event.target.value as StyleId;
              const nextPreset = getStylePresetById(nextId);
              setStyleId(nextId);
              setBpm((current) => clampBpm(current, nextPreset));
            }}
          >
            {presets.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="bpm-input">
            BPM
          </label>
          <input
            id="bpm-input"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={preset.bpmRange.min}
            max={preset.bpmRange.max}
            value={bpm}
            onChange={(event) => {
              const next = Number(event.target.value);
              setBpm(clampBpm(next, preset));
            }}
          />
        </div>

        <Button>Generate</Button>

        <div className={styles.transport}>
          <IconButton ariaLabel="Play">
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
          <IconButton ariaLabel="Stop">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
