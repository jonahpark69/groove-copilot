import type { StylePreset, StyleTrack, TrackId } from "@/features/engine/types";
import {
  clonePattern,
  countHits,
  createEmptyPattern,
  density,
  ensureLength,
  setStep,
  type Pattern,
} from "@/features/engine/pattern";
import { hashStringToSeed, mulberry32 } from "@/features/engine/rng";
import { autoFixPattern } from "@/features/engine/validatePattern";

export type GeneratedVariant = {
  id: "v1" | "v2" | "v3";
  name: string;
  description: string;
  pattern: Pattern;
  metrics: { hits: number; density: number };
};

const getTrackIdsById = (preset: StylePreset, ids: TrackId[]): TrackId[] =>
  preset.tracks.filter((track) => ids.includes(track.id)).map((track) => track.id);

const uniqueIds = (ids: TrackId[]): TrackId[] => Array.from(new Set(ids));

const findTrack = (
  preset: StylePreset,
  roles: string[],
  keywords: string[]
): StyleTrack | null => {
  const roleHit = preset.tracks.find((track) => roles.includes(track.role));
  if (roleHit) {
    return roleHit;
  }
  const needle = keywords.map((value) => value.toLowerCase());
  const keywordHit = preset.tracks.find((track) => {
    const haystack = `${track.id} ${track.name}`.toLowerCase();
    return needle.some((keyword) => haystack.includes(keyword));
  });
  return keywordHit ?? null;
};

const makeRng = (seed: string) => mulberry32(hashStringToSeed(seed));

const backbeatSteps = (steps: 16 | 32) => (steps === 32 ? [8, 24] : [4, 12]);

const addRandomHits = (
  pattern: Pattern,
  trackId: TrackId,
  steps: number,
  count: number,
  rng: () => number,
  blocked?: Set<number>
) => {
  const track = pattern[trackId];
  if (!track) {
    return;
  }
  const candidates: number[] = [];
  for (let i = 0; i < steps; i += 1) {
    if (!track[i] && !blocked?.has(i)) {
      candidates.push(i);
    }
  }
  for (let i = 0; i < count && candidates.length > 0; i += 1) {
    const pick = Math.floor(rng() * candidates.length);
    const stepIndex = candidates.splice(pick, 1)[0];
    track[stepIndex] = true;
  }
};

const setSteps = (pattern: Pattern, trackIds: TrackId[], steps: number[]) => {
  let next = pattern;
  trackIds.forEach((trackId) => {
    steps.forEach((step) => {
      next = setStep(next, trackId, step, true);
    });
  });
  return next;
};

const getPatternSteps = (pattern: Pattern): number => {
  const first = Object.values(pattern)[0];
  return first ? first.length : 16;
};

export function computeMetrics(pattern: Pattern): { hits: number; density: number } {
  const steps = getPatternSteps(pattern);
  const tracksCount = Object.keys(pattern).length;
  return {
    hits: countHits(pattern),
    density: density(pattern, tracksCount, steps),
  };
}

export function generateCore(args: {
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
  swing: number;
  complexity: number;
  seed: string;
}): Pattern {
  const rng = makeRng(args.seed);
  let next = createEmptyPattern(args.preset.tracks, args.steps);
  const complexityRatio = Math.min(Math.max(args.complexity / 100, 0), 1);
  const steps = args.steps;
  const beatBackbeat = backbeatSteps(steps);

  const kickTrack = findTrack(args.preset, ["kick"], ["kick", "bd"]);
  const snareTrack = findTrack(args.preset, ["snare", "clap"], [
    "snare",
    "clap",
  ]);
  const hatTrack = findTrack(args.preset, ["hat", "hihat"], [
    "hat",
    "hi-hat",
    "hihat",
  ]);
  const percTrack = findTrack(args.preset, ["perc"], [
    "perc",
    "percussion",
    "rim",
    "tom",
  ]);
  const bassTrack = findTrack(args.preset, ["bass", "808"], [
    "808",
    "bass",
    "sub",
  ]);

  if (process.env.NODE_ENV !== "production") {
    if (!kickTrack) {
      console.warn("[generateCore] missing track: kick", args.preset.id);
    }
    if (!snareTrack) {
      console.warn("[generateCore] missing track: snare/clap", args.preset.id);
    }
    if (!hatTrack) {
      console.warn("[generateCore] missing track: hat", args.preset.id);
    }
    if (!bassTrack) {
      console.warn("[generateCore] missing track: bass/808", args.preset.id);
    }
  }

  if (kickTrack) {
    next = setStep(next, kickTrack.id, 0, true);
  }

  if (snareTrack) {
    next = setSteps(next, [snareTrack.id], beatBackbeat);
  }

  if (hatTrack) {
    const hatSteps: number[] = [];
    if (args.complexity >= 60) {
      const interval = steps === 32 ? 2 : 1;
      for (let step = 0; step < steps; step += interval) {
        hatSteps.push(step);
      }
    } else {
      const interval = steps === 32 ? 4 : 2;
      for (let step = 0; step < steps; step += interval) {
        hatSteps.push(step);
      }
    }
    next = setSteps(next, [hatTrack.id], hatSteps);
  }

  const extraKicks = Math.round(1 + complexityRatio * 4);
  const extraPercs = Math.round(complexityRatio * 6);
  const hatRollChance = 0.05 + complexityRatio * 0.3;
  const blockedSteps = new Set<number>(beatBackbeat);

  if (kickTrack) {
    const candidates =
      steps === 32
        ? [6, 7, 14, 15, 22, 23, 30, 31]
        : [3, 7, 11, 15];
    const pool = candidates.filter((step) => !blockedSteps.has(step));
    for (let i = 0; i < extraKicks && pool.length > 0; i += 1) {
      const pick = Math.floor(rng() * pool.length);
      const stepIndex = pool.splice(pick, 1)[0];
      next[kickTrack.id][stepIndex] = true;
    }
  }

  if (percTrack) {
    const percCandidates: number[] = [];
    for (let step = 0; step < steps; step += 1) {
      if (step % 2 === 1 && !blockedSteps.has(step)) {
        percCandidates.push(step);
      }
    }
    const pool = percCandidates;
    for (let i = 0; i < extraPercs && pool.length > 0; i += 1) {
      const pick = Math.floor(rng() * pool.length);
      const stepIndex = pool.splice(pick, 1)[0];
      next[percTrack.id][stepIndex] = true;
    }
  }

  if (hatTrack) {
    const rollSteps =
      steps === 32 ? [steps - 2, steps - 1] : [steps - 2, steps - 1];
    rollSteps.forEach((step) => {
      if (rng() < hatRollChance) {
        next[hatTrack.id][step] = true;
      }
    });
  }

  if (bassTrack) {
    next = setStep(next, bassTrack.id, 0, true);
    if (args.complexity > 40 && kickTrack) {
      next[kickTrack.id].forEach((hit, index) => {
        if (hit && rng() < 0.4) {
          next[bassTrack.id][index] = true;
        }
      });
    }
  }

  let normalized = ensureLength(next, args.preset.tracks, args.steps);
  const metrics = computeMetrics(normalized);
  if (metrics.hits < 6) {
    if (kickTrack) {
      normalized = setStep(normalized, kickTrack.id, 0, true);
    }
    if (snareTrack) {
      normalized = setSteps(normalized, [snareTrack.id], beatBackbeat);
    }
    if (hatTrack) {
      const baseHatSteps: number[] = [];
      const interval = steps === 32 ? 4 : 2;
      for (let step = 0; step < steps; step += interval) {
        baseHatSteps.push(step);
      }
      normalized = setSteps(normalized, [hatTrack.id], baseHatSteps);
    }
  }

  return autoFixPattern({
    preset: args.preset,
    steps: args.steps,
    seed: args.seed,
    pattern: normalized,
  });
}

export function generateVariantsFromCore(args: {
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
  swing: number;
  complexity: number;
  seed: string;
  core: Pattern;
}): GeneratedVariant[] {
  const normalized = ensureLength(args.core, args.preset.tracks, args.steps);
  const hatIds = uniqueIds(
    getTrackIdsById(args.preset, ["hat", "ohat", "shaker"])
  );
  const percIds = uniqueIds(
    getTrackIdsById(args.preset, ["perc", "tom", "shaker"])
  );
  const grooveIds = uniqueIds([...hatIds, ...percIds]);

  const buildMinimal = () => {
    const rng = makeRng(`${args.seed}|v1`);
    const next = clonePattern(normalized);
    grooveIds.forEach((trackId) => {
      const steps = next[trackId] ?? [];
      steps.forEach((hit, index) => {
        if (hit && rng() < 0.3 + rng() * 0.2) {
          steps[index] = false;
        }
      });
    });
    return next;
  };

  const buildBalanced = () => {
    const rng = makeRng(`${args.seed}|v2`);
    const next = clonePattern(normalized);
    grooveIds.forEach((trackId) => {
      addRandomHits(next, trackId, args.steps, 1, rng);
    });
    return next;
  };

  const buildBusy = () => {
    const rng = makeRng(`${args.seed}|v3`);
    const next = clonePattern(normalized);
    grooveIds.forEach((trackId) => {
      addRandomHits(next, trackId, args.steps, 2, rng);
    });
    const fillStep = args.steps - 1;
    if (grooveIds.length > 0) {
      const target = grooveIds[Math.floor(rng() * grooveIds.length)];
      next[target][fillStep] = true;
    }
    return next;
  };

  const minimalPattern = autoFixPattern({
    preset: args.preset,
    steps: args.steps,
    seed: `${args.seed}|v1`,
    pattern: buildMinimal(),
  });
  const balancedPattern = autoFixPattern({
    preset: args.preset,
    steps: args.steps,
    seed: `${args.seed}|v2`,
    pattern: buildBalanced(),
  });
  const busyPattern = autoFixPattern({
    preset: args.preset,
    steps: args.steps,
    seed: `${args.seed}|v3`,
    pattern: buildBusy(),
  });

  return [
    {
      id: "v1",
      name: "Minimal",
      description: "Moins de hits, groove clair.",
      pattern: minimalPattern,
      metrics: computeMetrics(minimalPattern),
    },
    {
      id: "v2",
      name: "Balanced",
      description: "Proche du core, petites variations.",
      pattern: balancedPattern,
      metrics: computeMetrics(balancedPattern),
    },
    {
      id: "v3",
      name: "Busy",
      description: "Plus de texture et fills.",
      pattern: busyPattern,
      metrics: computeMetrics(busyPattern),
    },
  ];
}
