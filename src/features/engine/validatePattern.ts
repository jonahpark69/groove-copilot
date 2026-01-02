import type { StylePreset, TrackId } from "@/features/engine/types";
import {
  clonePattern,
  countHits,
  density,
  ensureLength,
  setStep,
  type Pattern,
} from "@/features/engine/pattern";

export type PatternIssue = {
  code: string;
  message: string;
  severity: "warn" | "error";
};

const BACKBEAT_STYLES = new Set([
  "trap",
  "drill",
  "boombap",
  "pop",
  "kpop",
  "reggaeton",
  "afrobeats",
]);

const getTrackIdsById = (preset: StylePreset, ids: TrackId[]): TrackId[] =>
  preset.tracks.filter((track) => ids.includes(track.id)).map((track) => track.id);

const getBackbeatIds = (preset: StylePreset): TrackId[] => {
  const byId = getTrackIdsById(preset, ["snare", "clap"]);
  if (byId.length > 0) {
    return byId;
  }
  return preset.tracks
    .filter((track) => track.role === "backbeat")
    .map((track) => track.id);
};

const getStepSignature = (steps: 16 | 32): number[] =>
  steps === 32 ? [8, 24] : [4, 12];

export function validatePattern(args: {
  preset: StylePreset;
  steps: 16 | 32;
  pattern: Pattern;
}): PatternIssue[] {
  const normalized = ensureLength(args.pattern, args.preset.tracks, args.steps);
  const issues: PatternIssue[] = [];
  const hits = countHits(normalized);
  const densityValue = density(
    normalized,
    args.preset.tracks.length,
    args.steps
  );

  if (hits === 0) {
    issues.push({
      code: "EMPTY_PATTERN",
      message: "Pattern vide.",
      severity: "error",
    });
  }

  if (densityValue > 0.35) {
    issues.push({
      code: "TOO_DENSE",
      message: "Pattern trop dense.",
      severity: "warn",
    });
  }

  if (densityValue < 0.03) {
    issues.push({
      code: "TOO_SPARSE",
      message: "Pattern trop sparse.",
      severity: "warn",
    });
  }

  const kickIds = getTrackIdsById(args.preset, ["kick"]);
  const bassIds = getTrackIdsById(args.preset, ["bass", "808", "sub"]);
  const backbeatIds = getBackbeatIds(args.preset);
  const backbeatSteps = getStepSignature(args.steps);

  if (kickIds.length > 0) {
    const hasKick = kickIds.some((trackId) =>
      normalized[trackId]?.some(Boolean)
    );
    if (!hasKick) {
      issues.push({
        code: "NO_KICK",
        message: "Kick absent.",
        severity: "error",
      });
    }
  }

  if (bassIds.length > 0) {
    const hasBass = bassIds.some((trackId) =>
      normalized[trackId]?.some(Boolean)
    );
    if (!hasBass) {
      issues.push({
        code: "NO_BASS",
        message: "Bass/808 absent.",
        severity: "warn",
      });
    }
  }

  if (backbeatIds.length > 0) {
    const hasBackbeat = backbeatIds.some((trackId) =>
      backbeatSteps.some((step) => normalized[trackId]?.[step])
    );
    if (!hasBackbeat) {
      issues.push({
        code: "NO_BACKBEAT",
        message: "Backbeat absent.",
        severity: BACKBEAT_STYLES.has(args.preset.id) ? "error" : "warn",
      });
    }
  }

  return issues;
}

export function autoFixPattern(args: {
  preset: StylePreset;
  steps: 16 | 32;
  seed: string;
  pattern: Pattern;
}): Pattern {
  let next = ensureLength(args.pattern, args.preset.tracks, args.steps);
  const issues = validatePattern({
    preset: args.preset,
    steps: args.steps,
    pattern: next,
  });

  const kickIds = getTrackIdsById(args.preset, ["kick"]);
  const bassIds = getTrackIdsById(args.preset, ["bass", "808", "sub"]);
  const hatIds = getTrackIdsById(args.preset, ["hat", "ohat", "shaker"]);
  const backbeatIds = getBackbeatIds(args.preset);
  const backbeatSteps = getStepSignature(args.steps);

  const setSteps = (pattern: Pattern, trackIds: TrackId[], steps: number[]) => {
    let updated = pattern;
    trackIds.forEach((trackId) => {
      steps.forEach((step) => {
        updated = setStep(updated, trackId, step, true);
      });
    });
    return updated;
  };

  const hasIssue = (code: string) =>
    issues.some((issue) => issue.code === code);

  if (hasIssue("EMPTY_PATTERN")) {
    next = clonePattern(next);
    if (kickIds.length > 0) {
      next = setSteps(next, kickIds, [0]);
    }
    if (backbeatIds.length > 0) {
      next = setSteps(next, backbeatIds, backbeatSteps);
    }
    if (hatIds.length > 0) {
      const hatSteps: number[] = [];
      const interval = args.steps === 32 ? 4 : 2;
      for (let step = 0; step < args.steps; step += interval) {
        hatSteps.push(step);
      }
      next = setSteps(next, hatIds, hatSteps);
    }
    if (bassIds.length > 0) {
      next = setSteps(next, bassIds, [0]);
    }
  }

  if (hasIssue("NO_BACKBEAT") && backbeatIds.length > 0) {
    next = setSteps(next, backbeatIds, backbeatSteps);
  }

  if (hasIssue("NO_KICK") && kickIds.length > 0) {
    next = setSteps(next, kickIds, [0]);
  }

  if (hasIssue("NO_BASS") && bassIds.length > 0) {
    next = setSteps(next, bassIds, [0]);
  }

  return ensureLength(next, args.preset.tracks, args.steps);
}
