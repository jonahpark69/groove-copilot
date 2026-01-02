"use client";

import { useEffect, useRef } from "react";
import type { Pattern } from "@/features/engine/pattern";
import { ensureLength } from "@/features/engine/pattern";
import { ensureAccentLength, hasAccent, type AccentMap } from "@/features/engine/accent";
import type { StylePreset, TrackId } from "@/features/engine/types";
import styles from "./SequencerGrid.module.scss";

type SequencerGridProps = {
  preset: StylePreset;
  steps: 16 | 32;
  pattern: Pattern;
  accents: AccentMap;
  playheadStep?: number | null;
  onToggle: (trackId: TrackId, step: number) => void;
  onToggleAccent: (trackId: TrackId, step: number) => void;
};

export default function SequencerGrid({
  preset,
  steps,
  pattern,
  accents,
  playheadStep = null,
  onToggle,
  onToggleAccent,
}: SequencerGridProps) {
  const safePattern = ensureLength(pattern, preset.tracks, steps);
  const safeAccents = ensureAccentLength(accents, preset.tracks, steps);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (trackId: TrackId, stepIndex: number) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      onToggle(trackId, stepIndex);
      clickTimeoutRef.current = null;
    }, 200);
  };

  const handleDoubleClick = (
    trackId: TrackId,
    stepIndex: number,
    isOn: boolean
  ) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (isOn) {
      onToggleAccent(trackId, stepIndex);
    }
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sequencer</h2>
        <span className={styles.meta}>Steps: {steps}</span>
      </div>

      <div className={styles.scroller}>
        <div
          className={`${styles.row} ${styles.headerRow}`}
          style={{
            gridTemplateColumns: `160px repeat(${steps}, 26px)`,
          }}
        >
          <div className={styles.headerSpacer} />
          {Array.from({ length: steps }, (_, index) => {
            const beatInBar = (index % 4) + 1;
            const barSep =
              index % 4 === 0 && index !== 0 ? styles.barSep : "";
            const isPlayhead = playheadStep === index;
            return (
              <div
                key={`step-${index}`}
                className={`${styles.stepNumber} ${barSep}`}
                data-beat={beatInBar}
                data-playhead={isPlayhead ? "true" : "false"}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        {preset.tracks.map((track) => (
          <div
            key={track.id}
            className={styles.row}
            style={{
              gridTemplateColumns: `160px repeat(${steps}, 26px)`,
            }}
          >
            <div className={styles.rowLabel}>{track.name}</div>
            {safePattern[track.id].map((isOn, stepIndex) => {
              const beatInBar = (stepIndex % 4) + 1;
              const barSep =
                stepIndex % 4 === 0 && stepIndex !== 0 ? styles.barSep : "";
              const isPlayhead = playheadStep === stepIndex;
              const isAccent =
                isOn && hasAccent(safeAccents, track.id, stepIndex);
              return (
                <button
                  key={`${track.id}-${stepIndex}`}
                  type="button"
                  className={`${styles.cell} ${isOn ? styles.cellOn : ""} ${barSep}`}
                  data-beat={beatInBar}
                  data-accent={isAccent ? "true" : "false"}
                  data-playhead={isPlayhead ? "true" : "false"}
                  aria-pressed={isOn}
                  onClick={() => handleClick(track.id, stepIndex)}
                  onDoubleClick={() =>
                    handleDoubleClick(track.id, stepIndex, isOn)
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
