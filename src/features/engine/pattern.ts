import type { StyleTrack, TrackId } from "@/features/engine/types";

export type TrackPattern = boolean[];
export type Pattern = Record<TrackId, TrackPattern>;

export function createEmptyPattern(
  tracks: StyleTrack[],
  steps: 16 | 32
): Pattern {
  const pattern = {} as Pattern;
  tracks.forEach((track) => {
    pattern[track.id] = Array.from({ length: steps }, () => false);
  });
  return pattern;
}

export function clonePattern(pattern: Pattern): Pattern {
  const next = {} as Pattern;
  Object.entries(pattern).forEach(([trackId, steps]) => {
    next[trackId as TrackId] = steps.slice();
  });
  return next;
}

export function setStep(
  pattern: Pattern,
  trackId: TrackId,
  step: number,
  value: boolean
): Pattern {
  const next = clonePattern(pattern);
  const current = next[trackId] ? next[trackId].slice() : [];
  if (step >= current.length) {
    const missing = step + 1 - current.length;
    current.push(...Array.from({ length: missing }, () => false));
  }
  current[step] = value;
  next[trackId] = current;
  return next;
}

export function toggleStep(
  pattern: Pattern,
  trackId: TrackId,
  step: number
): Pattern {
  const current = pattern[trackId] ?? [];
  const value = Boolean(current[step]);
  return setStep(pattern, trackId, step, !value);
}

export function countHits(pattern: Pattern): number {
  return Object.values(pattern).reduce(
    (sum, steps) => sum + steps.filter(Boolean).length,
    0
  );
}

export function trackHits(pattern: Pattern, trackId: TrackId): number {
  return (pattern[trackId] ?? []).filter(Boolean).length;
}

export function density(
  pattern: Pattern,
  tracksCount: number,
  steps: number
): number {
  if (tracksCount <= 0 || steps <= 0) {
    return 0;
  }
  return countHits(pattern) / (tracksCount * steps);
}

export function ensureLength(
  pattern: Pattern,
  tracks: StyleTrack[],
  steps: 16 | 32
): Pattern {
  const needsResize = tracks.some((track) => {
    const current = pattern[track.id];
    return !current || current.length !== steps;
  });

  if (!needsResize) {
    return pattern;
  }

  const next = {} as Pattern;
  tracks.forEach((track) => {
    const current = pattern[track.id] ?? [];
    const normalized = Array.from({ length: steps }, (_, index) => {
      return Boolean(current[index]);
    });
    next[track.id] = normalized;
  });
  return next;
}
