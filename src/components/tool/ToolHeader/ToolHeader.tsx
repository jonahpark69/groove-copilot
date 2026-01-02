"use client";

import { Badge, Button, IconButton } from "@/components/ui";
import { getStylePresetById } from "@/features/engine/presets";
import type { StyleId, StylePreset } from "@/features/engine/types";
import styles from "./ToolHeader.module.scss";

type ToolHeaderProps = {
  presets: StylePreset[];
  styleId: StyleId;
  bpm: number;
  onStyleChange: (next: StyleId) => void;
  onBpmChange: (next: number) => void;
  onGenerate: () => void;
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
  audioStatus: "off" | "loading" | "ready";
};

export default function ToolHeader({
  presets,
  styleId,
  bpm,
  onStyleChange,
  onBpmChange,
  onGenerate,
  onPlay,
  onStop,
  isPlaying,
  audioStatus,
}: ToolHeaderProps) {
  const preset = getStylePresetById(styleId);
  const subtitle = `${preset.name} • ${preset.bpmRange.min}-${preset.bpmRange.max} bpm • ${preset.tracks.length} tracks`;
  const audioLabel =
    audioStatus === "ready"
      ? "Audio: ready"
      : audioStatus === "loading"
      ? "Audio: loading"
      : "Audio: off";
  const audioTone =
    audioStatus === "ready"
      ? "success"
      : audioStatus === "loading"
      ? "warn"
      : "neutral";

  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <div>
          <p className={styles.kicker}>Groove Copilot</p>
          <h1 className={styles.title}>Layout Tool</h1>
          <p className={styles.kicker}>{subtitle}</p>
        </div>
        <div className={styles.badges}>
          <Badge tone="neutral">POC</Badge>
          <Badge tone={audioTone}>{audioLabel}</Badge>
        </div>
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
              onStyleChange(event.target.value as StyleId);
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
              onBpmChange(next);
            }}
          />
        </div>

        <Button onClick={onGenerate}>Generate</Button>

        <div className={styles.transport}>
          <IconButton label="Play" onClick={onPlay} disabled={isPlaying}>
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
          <IconButton label="Stop" onClick={onStop} disabled={!isPlaying}>
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
