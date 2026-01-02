import type { StyleTrack, TrackId } from "@/features/engine/types";

export type AccentMap = Record<TrackId, boolean[]>;

export function createEmptyAccents(
  tracks: StyleTrack[],
  steps: 16 | 32
): AccentMap {
  const accents = {} as AccentMap;
  tracks.forEach((track) => {
    accents[track.id] = Array.from({ length: steps }, () => false);
  });
  return accents;
}

export function ensureAccentLength(
  accents: AccentMap,
  tracks: StyleTrack[],
  steps: 16 | 32
): AccentMap {
  let changed = false;
  const next = {} as AccentMap;

  tracks.forEach((track) => {
    const current = accents?.[track.id];
    if (!Array.isArray(current)) {
      next[track.id] = Array.from({ length: steps }, () => false);
      changed = true;
      return;
    }

    if (current.length !== steps) {
      const resized = current.slice(0, steps);
      while (resized.length < steps) {
        resized.push(false);
      }
      next[track.id] = resized;
      changed = true;
      return;
    }

    next[track.id] = current;
  });

  return changed ? next : accents;
}

export function toggleAccent(
  accents: AccentMap,
  trackId: TrackId,
  step: number
): AccentMap {
  const next = { ...accents };
  const track = accents[trackId] ? [...accents[trackId]] : [];
  if (track.length === 0) {
    return accents;
  }
  track[step] = !track[step];
  next[trackId] = track;
  return next;
}

export function hasAccent(
  accents: AccentMap,
  trackId: TrackId,
  step: number
): boolean {
  return Boolean(accents?.[trackId]?.[step]);
}
