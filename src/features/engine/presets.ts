import type { StyleId, StylePreset } from "@/features/engine/types";
import trap from "@/data/styles/trap.json";
import drill from "@/data/styles/drill.json";
import boombap from "@/data/styles/boombap.json";
import pop from "@/data/styles/pop.json";
import kpop from "@/data/styles/kpop.json";
import afrobeats from "@/data/styles/afrobeats.json";
import reggaeton from "@/data/styles/reggaeton.json";
import electro from "@/data/styles/electro.json";
import { sanitizePreset, validatePresets } from "@/features/engine/validate";

const RAW = [
  trap,
  drill,
  boombap,
  pop,
  kpop,
  afrobeats,
  reggaeton,
  electro,
] as unknown as StylePreset[];

const ALL = RAW.map(sanitizePreset);
let hasWarned = false;

export function getStylePresets(): StylePreset[] {
  if (process.env.NODE_ENV !== "production" && !hasWarned) {
    const issues = validatePresets(ALL);
    if (issues.length > 0) {
      console.warn("[presets] Validation issues:", issues);
    }
    hasWarned = true;
  }
  return ALL;
}

export function getStylePresetById(id: StyleId): StylePreset {
  const preset = ALL.find((item) => item.id === id);
  if (!preset) {
    throw new Error(`Unknown style preset: ${id}`);
  }

  return preset;
}

export function clampBpm(bpm: number, preset: StylePreset): number {
  const { min, max } = preset.bpmRange;
  if (Number.isNaN(bpm)) {
    return preset.bpmRange.default;
  }

  return Math.min(Math.max(bpm, min), max);
}
