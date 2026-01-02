import type { Pattern } from "@/features/engine/pattern";
import { clonePattern, countHits, createEmptyPattern } from "@/features/engine/pattern";
import { hashStringToSeed, mulberry32 } from "@/features/engine/rng";
import type { StyleId, StylePreset, TrackId } from "@/features/engine/types";

const DENSITY_BY_STYLE: Record<StyleId, number> = {
  trap: 0.12,
  drill: 0.12,
  boombap: 0.1,
  pop: 0.14,
  kpop: 0.14,
  afrobeats: 0.13,
  reggaeton: 0.13,
  electro: 0.12,
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

function addRandomHits(
  pattern: Pattern,
  trackId: TrackId,
  steps: number,
  count: number,
  rng: () => number,
  blockedSteps?: Set<number>
): number {
  const track = pattern[trackId];
  if (!track) {
    return 0;
  }

  let added = 0;
  let attempts = 0;
  while (added < count && attempts < steps * 3) {
    const stepIndex = Math.floor(rng() * steps);
    attempts += 1;
    if (blockedSteps?.has(stepIndex)) {
      continue;
    }
    if (!track[stepIndex]) {
      track[stepIndex] = true;
      added += 1;
    }
  }

  return added;
}

export function applyRandom(args: {
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
  seed: string;
}): Pattern {
  const rng = mulberry32(hashStringToSeed(args.seed));
  const pattern = createEmptyPattern(args.preset.tracks, args.steps);
  const backbeatTracks = getTrackIdsByRole(args.preset, ["backbeat"]);
  const kickTracks = getTrackIdsById(args.preset, ["kick"]);
  const bassTracks = getTrackIdsByRole(args.preset, ["bass"]);
  const grooveTracks = getTrackIdsByRole(args.preset, ["groove", "texture"]);

  const backbeatSteps = args.steps === 32 ? [4, 12, 20, 28] : [4, 12];
  const blocked = new Set<number>();

  backbeatTracks.forEach((trackId) => {
    backbeatSteps.forEach((stepIndex) => {
      if (pattern[trackId]) {
        pattern[trackId][stepIndex] = true;
      }
      blocked.add(stepIndex);
    });
  });

  const kickCount = args.steps === 32 ? 6 : 4;
  kickTracks.forEach((trackId) => {
    addRandomHits(pattern, trackId, args.steps, kickCount, rng, blocked);
  });

  const bassCount = args.steps === 32 ? 4 : 3;
  bassTracks.forEach((trackId) => {
    addRandomHits(pattern, trackId, args.steps, bassCount, rng, blocked);
  });

  const targetDensity = DENSITY_BY_STYLE[args.preset.id] ?? 0.12;
  const targetHits = Math.round(
    targetDensity * args.preset.tracks.length * args.steps
  );
  let remaining = Math.max(0, targetHits - countHits(pattern));
  const grooveIds =
    grooveTracks.length > 0
      ? grooveTracks
      : args.preset.tracks.map((track) => track.id);
  let safety = remaining * 4 + args.steps * grooveIds.length;

  while (remaining > 0 && safety > 0) {
    const trackId = grooveIds[Math.floor(rng() * grooveIds.length)];
    if (addRandomHits(pattern, trackId, args.steps, 1, rng, blocked) > 0) {
      remaining -= 1;
    }
    safety -= 1;
  }

  return pattern;
}

export function applyHumanize(args: {
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
  seed: string;
  pattern: Pattern;
}): Pattern {
  const rng = mulberry32(hashStringToSeed(args.seed));
  const next = clonePattern(args.pattern);
  const grooveTracks = getTrackIdsByRole(args.preset, ["groove", "texture"]);

  const candidates: Array<{ trackId: TrackId; stepIndex: number }> = [];
  grooveTracks.forEach((trackId) => {
    const stepsArr = next[trackId] ?? [];
    stepsArr.forEach((hit, index) => {
      if (hit) {
        candidates.push({ trackId, stepIndex: index });
      }
    });
  });

  const moveCount = Math.max(1, Math.floor(candidates.length * 0.1));

  for (let i = 0; i < moveCount && candidates.length > 0; i += 1) {
    const pick = Math.floor(rng() * candidates.length);
    const { trackId, stepIndex } = candidates.splice(pick, 1)[0];
    const direction = rng() < 0.5 ? -1 : 1;
    const nextIndex = (stepIndex + direction + args.steps) % args.steps;
    if (!next[trackId][nextIndex]) {
      next[trackId][stepIndex] = false;
      next[trackId][nextIndex] = true;
    }
  }

  return next;
}
