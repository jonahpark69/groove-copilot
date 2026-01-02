import type { StylePreset, TrackId } from "@/features/engine/types";
import {
  clonePattern,
  countHits,
  density,
  ensureLength,
  trackHits,
  type Pattern,
} from "@/features/engine/pattern";
import { hashStringToSeed, mulberry32 } from "@/features/engine/rng";
import { makeSeed } from "@/features/engine/seed";

export type PatternVariant = {
  id: "simpler" | "busier" | "syncopated" | "fill" | "swing";
  name: string;
  description: string;
  pattern: Pattern;
  metrics: { hits: number; density: number };
};

function getTrackIdsByRole(
  preset: StylePreset,
  roles: StylePreset["tracks"][number]["role"][]
): TrackId[] {
  return preset.tracks
    .filter((track) => roles.includes(track.role))
    .map((track) => track.id);
}

function getTrackIdsById(preset: StylePreset, ids: TrackId[]): TrackId[] {
  return preset.tracks
    .filter((track) => ids.includes(track.id))
    .map((track) => track.id);
}

function getHitsByTrack(pattern: Pattern, trackId: TrackId): number[] {
  const steps = pattern[trackId] ?? [];
  const hits: number[] = [];
  steps.forEach((hit, index) => {
    if (hit) {
      hits.push(index);
    }
  });
  return hits;
}

function getHitSteps(pattern: Pattern, trackIds: TrackId[]): Set<number> {
  const steps = new Set<number>();
  trackIds.forEach((trackId) => {
    getHitsByTrack(pattern, trackId).forEach((hit) => steps.add(hit));
  });
  return steps;
}

function removeRandomHits(
  pattern: Pattern,
  trackId: TrackId,
  count: number,
  rng: () => number,
  protectedSteps?: Set<number>
) {
  if (count <= 0) {
    return;
  }
  const steps = pattern[trackId] ?? [];
  const hits = steps
    .map((hit, index) => (hit ? index : null))
    .filter((value): value is number => value !== null)
    .filter((index) => !protectedSteps?.has(index));

  for (let i = 0; i < count && hits.length > 0; i += 1) {
    const pick = Math.floor(rng() * hits.length);
    const stepIndex = hits.splice(pick, 1)[0];
    steps[stepIndex] = false;
  }
}

function addRandomHits(
  pattern: Pattern,
  trackId: TrackId,
  stepsCount: number,
  count: number,
  rng: () => number,
  blockedSteps?: Set<number>
) {
  if (count <= 0) {
    return;
  }
  const steps = pattern[trackId] ?? [];
  const candidates: number[] = [];
  for (let i = 0; i < stepsCount; i += 1) {
    if (!steps[i] && !blockedSteps?.has(i)) {
      candidates.push(i);
    }
  }

  for (let i = 0; i < count && candidates.length > 0; i += 1) {
    const pick = Math.floor(rng() * candidates.length);
    const stepIndex = candidates.splice(pick, 1)[0];
    steps[stepIndex] = true;
  }
}

function variantMetrics(
  pattern: Pattern,
  preset: StylePreset,
  steps: 16 | 32
) {
  return {
    hits: countHits(pattern),
    density: density(pattern, preset.tracks.length, steps),
  };
}

function buildSimpler(
  base: Pattern,
  preset: StylePreset,
  steps: 16 | 32,
  seed: string
): PatternVariant {
  const rng = mulberry32(hashStringToSeed(`${seed}:simpler`));
  const next = clonePattern(base);
  const grooveTracks = getTrackIdsByRole(preset, ["groove", "texture"]);
  grooveTracks.forEach((trackId) => {
    const hits = trackHits(next, trackId);
    const ratio = 0.15 + rng() * 0.1;
    const removeCount = Math.floor(hits * ratio);
    removeRandomHits(next, trackId, removeCount, rng);
  });

  return {
    id: "simpler",
    name: "Simpler",
    description: "Allege les hats/percs pour laisser respirer le groove.",
    pattern: next,
    metrics: variantMetrics(next, preset, steps),
  };
}

function buildBusier(
  base: Pattern,
  preset: StylePreset,
  steps: 16 | 32,
  seed: string
): PatternVariant {
  const rng = mulberry32(hashStringToSeed(`${seed}:busier`));
  const next = clonePattern(base);
  const grooveTracks = getTrackIdsByRole(preset, ["groove", "texture"]);
  const backbeatTracks = getTrackIdsByRole(preset, ["backbeat"]);
  const blocked = getHitSteps(next, backbeatTracks);

  grooveTracks.forEach((trackId) => {
    const hits = trackHits(next, trackId);
    const ratio = 0.1 + rng() * 0.1;
    const addCount = hits > 0 ? Math.max(1, Math.floor(hits * ratio)) : 0;
    addRandomHits(next, trackId, steps, addCount, rng, blocked);
  });

  return {
    id: "busier",
    name: "Busier",
    description: "Ajoute du mouvement dans les hats/percs sans surcharger la backbeat.",
    pattern: next,
    metrics: variantMetrics(next, preset, steps),
  };
}

function buildSyncopated(
  base: Pattern,
  preset: StylePreset,
  steps: 16 | 32,
  seed: string
): PatternVariant {
  const rng = mulberry32(hashStringToSeed(`${seed}:syncopated`));
  const next = clonePattern(base);
  const grooveTracks = getTrackIdsByRole(preset, ["groove", "texture"]);

  grooveTracks.forEach((trackId) => {
    const hits = getHitsByTrack(next, trackId);
    const moveCount = Math.floor(hits.length * (0.2 + rng() * 0.2));
    const available = hits.slice();

    for (let i = 0; i < moveCount && available.length > 0; i += 1) {
      const pick = Math.floor(rng() * available.length);
      const stepIndex = available.splice(pick, 1)[0];
      const nextIndex = (stepIndex + 1) % steps;
      if (!next[trackId][nextIndex]) {
        next[trackId][stepIndex] = false;
        next[trackId][nextIndex] = true;
      }
    }
  });

  return {
    id: "syncopated",
    name: "Syncopated",
    description: "Decale quelques hits de groove pour un flow plus syncope.",
    pattern: next,
    metrics: variantMetrics(next, preset, steps),
  };
}

function buildFill(
  base: Pattern,
  preset: StylePreset,
  steps: 16 | 32,
  seed: string
): PatternVariant {
  const rng = mulberry32(hashStringToSeed(`${seed}:fill`));
  const next = clonePattern(base);
  const grooveTracks = getTrackIdsByRole(preset, ["groove", "texture"]);
  const lastSteps = new Set<number>();
  for (let i = Math.max(0, steps - 4); i < steps; i += 1) {
    lastSteps.add(i);
  }

  grooveTracks.forEach((trackId) => {
    const candidates = Array.from(lastSteps).filter(
      (step) => !next[trackId][step]
    );
    const addCount = Math.min(candidates.length, rng() > 0.6 ? 2 : 1);
    for (let i = 0; i < addCount; i += 1) {
      const pick = Math.floor(rng() * candidates.length);
      const stepIndex = candidates.splice(pick, 1)[0];
      next[trackId][stepIndex] = true;
    }
  });

  return {
    id: "fill",
    name: "Fill",
    description: "Ajoute un fill leger sur la fin de boucle.",
    pattern: next,
    metrics: variantMetrics(next, preset, steps),
  };
}

function buildSwing(
  base: Pattern,
  preset: StylePreset,
  steps: 16 | 32,
  seed: string
): PatternVariant {
  const rng = mulberry32(hashStringToSeed(`${seed}:swing`));
  const next = clonePattern(base);
  const swingTracks = getTrackIdsById(preset, ["hat", "ohat", "shaker"]);

  swingTracks.forEach((trackId) => {
    for (let step = 0; step < steps; step += 1) {
      const isOffbeat = step % 2 === 1;
      if (isOffbeat && !next[trackId][step] && rng() < 0.3) {
        next[trackId][step] = true;
      }
      if (!isOffbeat && next[trackId][step] && rng() < 0.25) {
        next[trackId][step] = false;
      }
    }
  });

  return {
    id: "swing",
    name: "Swing",
    description: "Renforce les offbeats sur hats/shaker pour plus de swing.",
    pattern: next,
    metrics: variantMetrics(next, preset, steps),
  };
}

export function generateVariants(args: {
  base: Pattern;
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
}): PatternVariant[] {
  const normalized = ensureLength(args.base, args.preset.tracks, args.steps);
  const seed = makeSeed(
    {
      styleId: args.preset.id,
      bpm: args.bpm,
      steps: args.steps,
      patternHits: countHits(normalized),
    },
    "variants"
  );

  return [
    buildSimpler(normalized, args.preset, args.steps, seed),
    buildBusier(normalized, args.preset, args.steps, seed),
    buildSyncopated(normalized, args.preset, args.steps, seed),
    buildFill(normalized, args.preset, args.steps, seed),
    buildSwing(normalized, args.preset, args.steps, seed),
  ];
}
