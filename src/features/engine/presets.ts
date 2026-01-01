import type { StyleId, StylePreset } from "@/features/engine/types";
import trap from "@/data/styles/trap.json";
import drill from "@/data/styles/drill.json";
import boombap from "@/data/styles/boombap.json";
import pop from "@/data/styles/pop.json";
import kpop from "@/data/styles/kpop.json";
import afrobeats from "@/data/styles/afrobeats.json";
import reggaeton from "@/data/styles/reggaeton.json";
import electro from "@/data/styles/electro.json";

const ALL = [
  trap,
  drill,
  boombap,
  pop,
  kpop,
  afrobeats,
  reggaeton,
  electro,
] as unknown as StylePreset[];

function assertPreset(preset: StylePreset): void {
  if (!preset.id || !preset.name) {
    throw new Error("Invalid preset: missing id or name");
  }

  if (
    !preset.bpmRange ||
    typeof preset.bpmRange.min !== "number" ||
    typeof preset.bpmRange.max !== "number" ||
    typeof preset.bpmRange.default !== "number"
  ) {
    throw new Error(`Invalid preset ${preset.id}: invalid bpmRange`);
  }

  if (
    preset.bpmRange.min > preset.bpmRange.max ||
    preset.bpmRange.default < preset.bpmRange.min ||
    preset.bpmRange.default > preset.bpmRange.max
  ) {
    throw new Error(`Invalid preset ${preset.id}: bpmRange out of bounds`);
  }

  if (!Array.isArray(preset.tracks) || preset.tracks.length === 0) {
    throw new Error(`Invalid preset ${preset.id}: tracks missing`);
  }
}

export function getStylePresets(): StylePreset[] {
  ALL.forEach(assertPreset);
  return ALL;
}

export function getStylePresetById(id: StyleId): StylePreset {
  const preset = ALL.find((item) => item.id === id);
  if (!preset) {
    throw new Error(`Unknown style preset: ${id}`);
  }

  assertPreset(preset);
  return preset;
}

export function clampBpm(bpm: number, preset: StylePreset): number {
  const { min, max } = preset.bpmRange;
  if (Number.isNaN(bpm)) {
    return preset.bpmRange.default;
  }

  return Math.min(Math.max(bpm, min), max);
}
