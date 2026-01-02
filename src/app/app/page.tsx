"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Slider } from "@/components/ui";
import SequencerActions from "@/components/sequencer/SequencerActions";
import SequencerGrid from "@/components/sequencer/SequencerGrid";
import CoachPanel from "@/components/tool/CoachPanel";
import ToolHeader from "@/components/tool/ToolHeader/ToolHeader";
import VariantsPanel from "@/components/tool/VariantsPanel";
import { createEmptyPattern, ensureLength, type Pattern } from "@/features/engine/pattern";
import { clampBpm, getStylePresetById, getStylePresets } from "@/features/engine/presets";
import { createEmptyAccents, ensureAccentLength, type AccentMap } from "@/features/engine/accent";
import type { StyleId } from "@/features/engine/types";
import {
  deriveDisplayedPattern,
  toolReducer,
  type ToolState,
} from "@/features/state/toolState";
import { AudioEngine, trackToSampleKey } from "@/features/audio/audioEngine";
import { createScheduler } from "@/features/audio/scheduler";
import styles from "./page.module.scss";

export default function AppPage() {
  const presets = getStylePresets();
  const initialPreset = getStylePresetById("trap");
  const initialState: ToolState = {
    styleId: "trap",
    bpm: initialPreset.bpmRange.default,
    steps: initialPreset.stepsDefault,
    swing: 20,
    complexity: 50,
    patternCore: createEmptyPattern(
      initialPreset.tracks,
      initialPreset.stepsDefault
    ),
    accents: createEmptyAccents(initialPreset.tracks, initialPreset.stepsDefault),
    variants: [],
    activeVariantId: "core",
    lastSeed: null,
    isPlaying: false,
    playheadStep: 0,
  };
  const [state, dispatch] = useReducer(toolReducer, initialState);
  const preset = getStylePresetById(state.styleId);
  const displayedPattern = deriveDisplayedPattern(state);
  const stateRef = useRef(state);
  const patternRef = useRef(displayedPattern);
  const engineRef = useRef<AudioEngine | null>(null);
  const schedulerRef = useRef<ReturnType<typeof createScheduler> | null>(null);
  const [audioStatus, setAudioStatus] = useState<"off" | "loading" | "ready">("off");
  const resyncRef = useRef(false);
  const prevBpmRef = useRef(state.bpm);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    patternRef.current = displayedPattern;
  }, [displayedPattern]);

  useEffect(() => {
    const prev = prevBpmRef.current;
    if (prev !== state.bpm && state.isPlaying) {
      if (!resyncRef.current) {
        resyncRef.current = true;
        dispatch({ type: "STOP" });
        dispatch({ type: "PLAY" });
        setTimeout(() => {
          resyncRef.current = false;
        }, 0);
      }
    }
    prevBpmRef.current = state.bpm;
  }, [state.bpm, state.isPlaying]);

  useEffect(() => {
    try {
      const storedStyleId = localStorage.getItem("grooveCopilot.styleId");
      const storedBpm = localStorage.getItem("grooveCopilot.bpm");
      const storedPattern =
        localStorage.getItem("grooveCopilot.patternCore") ??
        localStorage.getItem("grooveCopilot.pattern");
      const storedAccents = localStorage.getItem("grooveCopilot.accents");
      const storedSwing = localStorage.getItem("grooveCopilot.swing");
      const storedComplexity = localStorage.getItem("grooveCopilot.complexity");
      const availablePresets = getStylePresets();
      const presetIds = new Set(availablePresets.map((item) => item.id));
      const nextStyleId = presetIds.has(storedStyleId as StyleId)
        ? (storedStyleId as StyleId)
        : "trap";
      const nextPreset = getStylePresetById(nextStyleId);

      let nextBpm = nextPreset.bpmRange.default;
      if (storedBpm) {
        const parsedBpm = Number(storedBpm);
        if (!Number.isNaN(parsedBpm)) {
          nextBpm = clampBpm(parsedBpm, nextPreset);
        }
      }

      let nextPattern = createEmptyPattern(
        nextPreset.tracks,
        nextPreset.stepsDefault
      );
      if (storedPattern) {
        try {
          const parsedPattern = JSON.parse(storedPattern) as Pattern;
          if (parsedPattern && typeof parsedPattern === "object") {
            nextPattern = ensureLength(
              parsedPattern,
              nextPreset.tracks,
              nextPreset.stepsDefault
            );
          }
        } catch {
          // ignore invalid pattern JSON
        }
      }

      let nextAccents = createEmptyAccents(
        nextPreset.tracks,
        nextPreset.stepsDefault
      );
      if (storedAccents) {
        try {
          const parsedAccents = JSON.parse(storedAccents) as AccentMap;
          if (parsedAccents && typeof parsedAccents === "object") {
            nextAccents = ensureAccentLength(
              parsedAccents,
              nextPreset.tracks,
              nextPreset.stepsDefault
            );
          }
        } catch {
          // ignore invalid accents JSON
        }
      }

      let nextSwing = 20;
      if (storedSwing) {
        const parsedSwing = Number(storedSwing);
        if (!Number.isNaN(parsedSwing)) {
          nextSwing = Math.min(Math.max(parsedSwing, 0), 60);
        }
      }

      let nextComplexity = 50;
      if (storedComplexity) {
        const parsedComplexity = Number(storedComplexity);
        if (!Number.isNaN(parsedComplexity)) {
          nextComplexity = Math.min(Math.max(parsedComplexity, 0), 100);
        }
      }

      dispatch({
        type: "HYDRATE",
        payload: {
          styleId: nextStyleId,
          bpm: nextBpm,
          swing: nextSwing,
          complexity: nextComplexity,
          patternCore: nextPattern,
          accents: nextAccents,
          activeVariantId: "core",
          lastSeed: null,
        },
      });
    } catch {
      // ignore localStorage failures
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("grooveCopilot.styleId", state.styleId);
        localStorage.setItem("grooveCopilot.bpm", String(state.bpm));
        localStorage.setItem("grooveCopilot.swing", String(state.swing));
        localStorage.setItem(
          "grooveCopilot.complexity",
          String(state.complexity)
        );
        localStorage.setItem(
          "grooveCopilot.activeVariantId",
          state.activeVariantId
        );
        const normalized = ensureLength(
          state.patternCore,
          preset.tracks,
          state.steps
        );
        localStorage.setItem(
          "grooveCopilot.patternCore",
          JSON.stringify(normalized)
        );
        const normalizedAccents = ensureAccentLength(
          state.accents,
          preset.tracks,
          state.steps
        );
        localStorage.setItem(
          "grooveCopilot.accents",
          JSON.stringify(normalizedAccents)
        );
      } catch {
        // ignore localStorage failures
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [
    state.styleId,
    state.bpm,
    state.swing,
    state.complexity,
    state.patternCore,
    state.accents,
    state.activeVariantId,
    state.steps,
    preset,
  ]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
      }
      return;
    }
    const beatMs = 60000 / state.bpm;
    const stepMs = state.steps === 32 ? beatMs / 8 : beatMs / 4;
    const interval = setInterval(
      () => dispatch({ type: "TICK_PLAYHEAD" }),
      stepMs
    );
    let cancelled = false;
    const startAudio = async () => {
      let engine = engineRef.current;
      if (!engine) {
        engine = new AudioEngine();
        engineRef.current = engine;
      }
      if (!engine.isReady()) {
        setAudioStatus("loading");
        try {
          await engine.init();
        } catch {
          setAudioStatus("off");
          return;
        }
      }
      if (cancelled) {
        return;
      }
      if (engine.ctx && engine.ctx.state === "suspended") {
        await engine.ctx.resume();
      }
      setAudioStatus(engine.isReady() ? "ready" : "off");

      const getSchedulerState = () => {
        const current = stateRef.current;
        return {
          bpm: current.bpm,
          steps: current.steps,
          pattern: patternRef.current,
          accents: current.accents,
          preset: getStylePresetById(current.styleId),
        };
      };

      if (!schedulerRef.current) {
        schedulerRef.current = createScheduler({
          getState: getSchedulerState,
          getNow: () => engine?.ctx?.currentTime ?? 0,
          onStep: (stepIndex, time) => {
            const { preset, pattern, accents } = getSchedulerState();
            preset.tracks.forEach((track) => {
              if (!pattern[track.id]?.[stepIndex]) {
                return;
              }
              const key = trackToSampleKey(track);
              if (!key) {
                return;
              }
              const isAccent = Boolean(accents?.[track.id]?.[stepIndex]);
              const isHat = key === "hat" || key === "perc";
              const velocity = isAccent ? 1 : isHat ? 0.65 : 0.8;
              engine?.playHit(key, time, velocity);
            });
          },
        });
      }
      schedulerRef.current.start();
    };
    startAudio();
    return () => {
      cancelled = true;
      if (schedulerRef.current) {
        schedulerRef.current.stop();
      }
      clearInterval(interval);
    };
  }, [state.isPlaying, state.bpm, state.steps]);

  return (
    <main className={styles.page}>
      <ToolHeader
        presets={presets}
        styleId={state.styleId}
        bpm={state.bpm}
        onStyleChange={(next) => dispatch({ type: "SET_STYLE", styleId: next })}
        onBpmChange={(next) => dispatch({ type: "SET_BPM", bpm: next })}
        onGenerate={() => dispatch({ type: "GENERATE" })}
        onPlay={() => dispatch({ type: "PLAY" })}
        onStop={() => dispatch({ type: "STOP" })}
        isPlaying={state.isPlaying}
        audioStatus={audioStatus}
      />
      <div className={styles.stack}>
        <section className={styles.controls}>
          <div className={styles.controlsHeader}>
            <div>
              <p className={styles.controlsKicker}>Core</p>
              <p className={styles.controlsSubtitle}>
                Ajuste swing/complexity puis genere des variantes.
              </p>
            </div>
          </div>
          <div className={styles.sliders}>
            <Slider
              label="Swing"
              hint="0-60"
              value={state.swing}
              min={0}
              max={60}
              step={1}
              onChange={(value) =>
                dispatch({ type: "SET_SWING", swing: value })
              }
            />
            <Slider
              label="Complexity"
              hint="0-100"
              value={state.complexity}
              min={0}
              max={100}
              step={1}
              onChange={(value) =>
                dispatch({ type: "SET_COMPLEXITY", complexity: value })
              }
            />
          </div>
        </section>
        <SequencerActions
          preset={preset}
          styleId={state.styleId}
          bpm={state.bpm}
          steps={state.steps}
          pattern={state.patternCore}
          lastSeed={state.lastSeed}
          onClear={() => dispatch({ type: "CLEAR" })}
          onRandom={(seed) => dispatch({ type: "RANDOM", seed })}
          onHumanize={(seed) => dispatch({ type: "HUMANIZE", seed })}
          onBpmChange={(next) => dispatch({ type: "SET_BPM", bpm: next })}
          onRequestStyleChange={(next) =>
            dispatch({ type: "SET_STYLE", styleId: next })
          }
        />
        <SequencerGrid
          preset={preset}
          steps={state.steps}
          pattern={displayedPattern}
          accents={state.accents}
          playheadStep={state.isPlaying ? state.playheadStep : null}
          onToggle={(trackId, step) =>
            dispatch({ type: "TOGGLE_STEP", trackId, step })
          }
          onToggleAccent={(trackId, step) =>
            dispatch({ type: "TOGGLE_ACCENT", trackId, step })
          }
        />
        <VariantsPanel
          preset={preset}
          bpm={state.bpm}
          steps={state.steps}
          pattern={displayedPattern}
          variants={state.variants}
          activeVariantId={state.activeVariantId}
          onSelect={(id) => dispatch({ type: "SET_ACTIVE_VARIANT", id })}
        />
        <CoachPanel preset={preset} />
      </div>
    </main>
  );
}
