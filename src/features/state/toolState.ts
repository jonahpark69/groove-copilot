import {
  clampBpm,
  getStylePresetById,
} from "@/features/engine/presets";
import {
  createEmptyPattern,
  ensureLength,
  toggleStep,
  countHits,
  type Pattern,
} from "@/features/engine/pattern";
import {
  createEmptyAccents,
  ensureAccentLength,
  toggleAccent,
  type AccentMap,
} from "@/features/engine/accent";
import { applyHumanize, applyRandom } from "@/features/engine/actions";
import {
  generateCore,
  generateVariantsFromCore,
} from "@/features/engine/generate";
import { makeSeed } from "@/features/engine/seed";
import type { StyleId, StylePreset, TrackId } from "@/features/engine/types";

export type ActiveVariantId = "core" | "v1" | "v2" | "v3";

export type ToolVariant = {
  id: "v1" | "v2" | "v3";
  name: string;
  description: string;
  pattern: Pattern;
  metrics: { hits: number; density: number };
};

export type ToolState = {
  styleId: StyleId;
  bpm: number;
  steps: 16 | 32;
  swing: number;
  complexity: number;
  patternCore: Pattern;
  accents: AccentMap;
  variants: ToolVariant[];
  activeVariantId: ActiveVariantId;
  lastSeed: string | null;
  isPlaying: boolean;
  playheadStep: number;
};

export type ToolAction =
  | { type: "SET_STYLE"; styleId: StyleId }
  | { type: "SET_BPM"; bpm: number }
  | { type: "SET_SWING"; swing: number }
  | { type: "SET_COMPLEXITY"; complexity: number }
  | { type: "TOGGLE_STEP"; trackId: TrackId; step: number }
  | { type: "SET_ACTIVE_VARIANT"; id: ActiveVariantId }
  | { type: "GENERATE"; seed?: string }
  | { type: "CLEAR" }
  | { type: "RANDOM"; seed?: string }
  | { type: "HUMANIZE"; seed?: string }
  | { type: "TOGGLE_ACCENT"; trackId: TrackId; step: number }
  | { type: "PLAY" }
  | { type: "STOP" }
  | { type: "TICK_PLAYHEAD" }
  | { type: "SET_LAST_SEED"; seed: string | null }
  | {
      type: "HYDRATE";
      payload: {
        styleId: StyleId;
        bpm: number;
        swing: number;
        complexity: number;
        patternCore: Pattern;
        accents: AccentMap;
        activeVariantId: ActiveVariantId;
        lastSeed: string | null;
      };
    };

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

export function derivePreset(state: ToolState): StylePreset {
  return getStylePresetById(state.styleId);
}

export function deriveDisplayedPattern(state: ToolState): Pattern {
  if (state.activeVariantId === "core") {
    return state.patternCore;
  }
  const variant = state.variants.find((item) => item.id === state.activeVariantId);
  return variant ? variant.pattern : state.patternCore;
}

export function toolReducer(state: ToolState, action: ToolAction): ToolState {
  switch (action.type) {
    case "SET_STYLE": {
      const preset = getStylePresetById(action.styleId);
      const steps = preset.stepsDefault;
      return {
        ...state,
        styleId: action.styleId,
        steps,
        bpm: clampBpm(state.bpm, preset),
        patternCore: createEmptyPattern(preset.tracks, steps),
        accents: createEmptyAccents(preset.tracks, steps),
        variants: [],
        activeVariantId: "core",
        isPlaying: false,
        playheadStep: 0,
      };
    }
    case "SET_BPM": {
      const preset = derivePreset(state);
      return {
        ...state,
        bpm: clampBpm(action.bpm, preset),
      };
    }
    case "SET_SWING": {
      return {
        ...state,
        swing: clampNumber(action.swing, 0, 60),
        variants: [],
        activeVariantId: "core",
      };
    }
    case "SET_COMPLEXITY": {
      return {
        ...state,
        complexity: clampNumber(action.complexity, 0, 100),
        variants: [],
        activeVariantId: "core",
      };
    }
    case "TOGGLE_STEP": {
      const preset = derivePreset(state);
      const normalized = ensureLength(state.patternCore, preset.tracks, state.steps);
      const nextPattern = toggleStep(normalized, action.trackId, action.step);
      const normalizedAccents = ensureAccentLength(
        state.accents,
        preset.tracks,
        state.steps
      );
      let nextAccents = normalizedAccents;
      if (!nextPattern[action.trackId]?.[action.step]) {
        const trackAccents = [...(normalizedAccents[action.trackId] ?? [])];
        if (trackAccents.length > 0) {
          trackAccents[action.step] = false;
          nextAccents = { ...normalizedAccents, [action.trackId]: trackAccents };
        }
      }
      return {
        ...state,
        patternCore: nextPattern,
        accents: nextAccents,
        variants: [],
        activeVariantId: "core",
      };
    }
    case "TOGGLE_ACCENT": {
      const preset = derivePreset(state);
      const normalized = ensureLength(state.patternCore, preset.tracks, state.steps);
      if (!normalized[action.trackId]?.[action.step]) {
        return state;
      }
      const normalizedAccents = ensureAccentLength(
        state.accents,
        preset.tracks,
        state.steps
      );
      return {
        ...state,
        accents: toggleAccent(normalizedAccents, action.trackId, action.step),
      };
    }
    case "SET_ACTIVE_VARIANT": {
      if (action.id === "core") {
        return { ...state, activeVariantId: "core" };
      }
      const exists = state.variants.some((variant) => variant.id === action.id);
      return {
        ...state,
        activeVariantId: exists ? action.id : "core",
      };
    }
    case "GENERATE": {
      const preset = derivePreset(state);
      const seed =
        action.seed ??
        makeSeed(
          {
            styleId: state.styleId,
            bpm: state.bpm,
            steps: state.steps,
            patternHits: 0,
          },
          "variants"
        );
      const core = generateCore({
        preset,
        bpm: state.bpm,
        steps: state.steps,
        swing: state.swing,
        complexity: state.complexity,
        seed: `${seed}|core`,
      });
      const variants = generateVariantsFromCore({
        preset,
        bpm: state.bpm,
        steps: state.steps,
        swing: state.swing,
        complexity: state.complexity,
        seed,
        core,
      });
      return {
        ...state,
        patternCore: core,
        accents: createEmptyAccents(preset.tracks, state.steps),
        variants,
        activeVariantId: "core",
        lastSeed: seed,
      };
    }
    case "CLEAR": {
      const preset = derivePreset(state);
      return {
        ...state,
        patternCore: createEmptyPattern(preset.tracks, state.steps),
        accents: createEmptyAccents(preset.tracks, state.steps),
        variants: [],
        activeVariantId: "core",
        isPlaying: false,
        playheadStep: 0,
      };
    }
    case "RANDOM": {
      const preset = derivePreset(state);
      const seed =
        action.seed ??
        makeSeed(
          {
            styleId: state.styleId,
            bpm: state.bpm,
            steps: state.steps,
            patternHits: 0,
          },
          "random"
        );
      return {
        ...state,
        patternCore: applyRandom({
          preset,
          bpm: state.bpm,
          steps: state.steps,
          seed,
        }),
        accents: createEmptyAccents(preset.tracks, state.steps),
        variants: [],
        activeVariantId: "core",
        lastSeed: seed,
      };
    }
    case "HUMANIZE": {
      const preset = derivePreset(state);
      const seed =
        action.seed ??
        makeSeed(
          {
            styleId: state.styleId,
            bpm: state.bpm,
            steps: state.steps,
            patternHits: countHits(state.patternCore),
          },
          "humanize"
        );
      return {
        ...state,
        patternCore: applyHumanize({
          preset,
          bpm: state.bpm,
          steps: state.steps,
          seed,
          pattern: state.patternCore,
        }),
        accents: createEmptyAccents(preset.tracks, state.steps),
        variants: [],
        activeVariantId: "core",
        lastSeed: seed,
      };
    }
    case "PLAY":
      return { ...state, isPlaying: true };
    case "STOP":
      return { ...state, isPlaying: false, playheadStep: 0 };
    case "TICK_PLAYHEAD": {
      if (!state.isPlaying) {
        return state;
      }
      return {
        ...state,
        playheadStep: (state.playheadStep + 1) % state.steps,
      };
    }
    case "SET_LAST_SEED":
      return { ...state, lastSeed: action.seed };
    case "HYDRATE": {
      const preset = getStylePresetById(action.payload.styleId);
      const steps = preset.stepsDefault;
      const nextPattern = ensureLength(
        action.payload.patternCore,
        preset.tracks,
        steps
      );
      const nextAccents = ensureAccentLength(
        action.payload.accents,
        preset.tracks,
        steps
      );
      return {
        ...state,
        styleId: action.payload.styleId,
        steps,
        bpm: clampBpm(action.payload.bpm, preset),
        swing: clampNumber(action.payload.swing, 0, 60),
        complexity: clampNumber(action.payload.complexity, 0, 100),
        patternCore: nextPattern,
        accents: nextAccents,
        variants: [],
        activeVariantId: "core",
        lastSeed: action.payload.lastSeed,
        isPlaying: false,
        playheadStep: 0,
      };
    }
    default:
      return state;
  }
}
