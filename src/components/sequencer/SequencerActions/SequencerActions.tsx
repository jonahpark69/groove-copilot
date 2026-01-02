"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Button } from "@/components/ui";
import { countHits, type Pattern } from "@/features/engine/pattern";
import { getStylePresetById } from "@/features/engine/presets";
import {
  makeSeed,
  parseSeed,
  seedToClipboardText,
  type SeedAction,
  type ParsedSeed,
} from "@/features/engine/seed";
import type { StyleId, StylePreset } from "@/features/engine/types";
import styles from "./SequencerActions.module.scss";

type SequencerActionsProps = {
  preset: StylePreset;
  styleId: StyleId;
  bpm: number;
  steps: 16 | 32;
  pattern: Pattern;
  lastSeed: string | null;
  onClear: () => void;
  onRandom: (seed: string) => void;
  onHumanize: (seed: string) => void;
  onBpmChange: (next: number) => void;
  onRequestStyleChange: (next: StyleId) => void;
};

export default function SequencerActions({
  preset,
  styleId,
  bpm,
  steps,
  pattern,
  lastSeed,
  onClear,
  onRandom,
  onHumanize,
  onBpmChange,
  onRequestStyleChange,
}: SequencerActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reapplied, setReapplied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [seedInput, setSeedInput] = useState("");
  const [seedError, setSeedError] = useState("");

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reapplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (reapplyTimeoutRef.current) {
        clearTimeout(reapplyTimeoutRef.current);
      }
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }
    };
  }, []);

  const flash = (
    setter: (value: boolean) => void,
    ref: MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    setter(true);
    if (ref.current) {
      clearTimeout(ref.current);
    }
    ref.current = setTimeout(() => setter(false), 1000);
  };

  const handleCopySeed = async () => {
    if (!lastSeed) {
      return;
    }
    try {
      await navigator.clipboard.writeText(seedToClipboardText(lastSeed));
      flash(setCopied, copyTimeoutRef);
    } catch {
      // ignore clipboard failures
    }
  };

  const applySeedAction = (action: SeedAction, seed: string) => {
    if (action === "random") {
      onRandom(seed);
      return;
    }

    if (action === "humanize") {
      onHumanize(seed);
    }
  };

  const applyParsedSeed = (parsed: ParsedSeed): boolean => {
    if (parsed.action === "variants") {
      setSeedError("Action variants non supportee ici.");
      return false;
    }

    let nextPreset: StylePreset;
    try {
      nextPreset = getStylePresetById(parsed.styleId as StyleId);
    } catch {
      setSeedError("Style inconnu.");
      return false;
    }

    if (nextPreset.id !== styleId) {
      onRequestStyleChange(nextPreset.id);
    }

    onBpmChange(parsed.bpm);

    applySeedAction(parsed.action, parsed.raw);
    return true;
  };

  const handleRandom = () => {
    const seed = makeSeed(
      {
        styleId: preset.id,
        bpm,
        steps,
        patternHits: 0,
      },
      "random"
    );
    onRandom(seed);
  };

  const handleHumanize = () => {
    const seed = makeSeed(
      {
        styleId: preset.id,
        bpm,
        steps,
        patternHits: countHits(pattern),
      },
      "humanize"
    );
    onHumanize(seed);
  };

  const handleReapply = () => {
    if (!lastSeed) {
      return;
    }
    const parsed = parseSeed(lastSeed);
    if (!parsed || parsed.action === "variants") {
      return;
    }
    setSeedError("");
    applyParsedSeed(parsed);
    flash(setReapplied, reapplyTimeoutRef);
  };

  const handleApplySeed = () => {
    setSeedError("");
    const parsed = parseSeed(seedInput);
    if (!parsed) {
      setSeedError("Seed invalide.");
      return;
    }
    const ok = applyParsedSeed(parsed);
    if (ok) {
      setSeedInput("");
      flash(setApplied, applyTimeoutRef);
    }
  };

  return (
    <section className={styles.wrap}>
      <div>
        <p className={styles.title}>Quick Actions</p>
        <p className={styles.subtitle}>Clear, random, or humanize the grid.</p>
      </div>
      <div className={styles.buttons}>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRandom}>
          Random
        </Button>
        <Button size="sm" variant="ghost" onClick={handleHumanize}>
          Humanize
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReapply}
          disabled={!lastSeed}
        >
          {reapplied ? "Reapplied" : "Reapply"}
        </Button>
        <div className={styles.copyWrap}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopySeed}
            disabled={!lastSeed}
          >
            {copied ? "Copied" : "Copy seed"}
          </Button>
          {!lastSeed && <span className={styles.hint}>aucune action</span>}
        </div>
      </div>
      <div className={styles.seedRow}>
        <input
          className={styles.seedInput}
          value={seedInput}
          onChange={(event) => setSeedInput(event.target.value)}
          placeholder="Paste seed..."
        />
        <Button size="sm" variant="ghost" onClick={handleApplySeed}>
          {applied ? "Applied" : "Apply seed"}
        </Button>
        {seedError && <span className={styles.error}>{seedError}</span>}
      </div>
    </section>
  );
}
