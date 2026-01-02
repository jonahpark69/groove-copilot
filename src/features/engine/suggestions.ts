import type { StylePreset, TrackId } from "@/features/engine/types";
import { countHits, density, trackHits, type Pattern } from "@/features/engine/pattern";

export type CoachSuggestion = {
  severity: "info" | "warn";
  title: string;
  body: string;
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

export function getCoachSuggestions(args: {
  pattern: Pattern;
  preset: StylePreset;
  steps: 16 | 32;
  bpm: number;
}): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  const { pattern, preset, steps } = args;

  const backbeatTracks = getTrackIdsByRole(preset, ["backbeat"]);
  if (backbeatTracks.length > 0) {
    const hits = backbeatTracks.reduce(
      (sum, trackId) => sum + trackHits(pattern, trackId),
      0
    );
    const minHits = steps === 32 ? 4 : 2;
    if (hits < minHits) {
      suggestions.push({
        severity: "warn",
        title: "Backbeat sous-dose",
        body: "Ajoute une ou deux frappes de snare/clap sur les temps forts.",
      });
    }
  }

  const topTracks = getTrackIdsByRole(preset, ["groove", "texture"]);
  if (topTracks.length > 0) {
    const topHits = topTracks.reduce(
      (sum, trackId) => sum + trackHits(pattern, trackId),
      0
    );
    const topDensity = topHits / (topTracks.length * steps);
    if (topDensity > 0.5) {
      suggestions.push({
        severity: "warn",
        title: "Top trop dense",
        body: "Reduis quelques hats/percs pour laisser plus d'air.",
      });
    }
  }

  const globalDensity = density(pattern, preset.tracks.length, steps);
  if (globalDensity < 0.08) {
      suggestions.push({
        severity: "info",
        title: "Pattern trop vide",
        body: "Ajoute quelques hits de groove ou une texture legere.",
      });
  }

  if (preset.id === "trap" || preset.id === "drill") {
    const bassTracks = getTrackIdsById(preset, ["808"]);
    if (bassTracks.length === 0 || trackHits(pattern, bassTracks[0]) === 0) {
      suggestions.push({
        severity: "warn",
        title: "808 manquant",
        body: "Ajoute un motif 808 pour ancrer le sub.",
      });
    }
  }

  if (preset.id === "pop" || preset.id === "kpop") {
    const chordsTracks = getTrackIdsById(preset, ["chords"]);
    const leadTracks = getTrackIdsById(preset, ["lead"]);
    const chordsHits = chordsTracks.reduce(
      (sum, trackId) => sum + trackHits(pattern, trackId),
      0
    );
    const leadHits = leadTracks.reduce(
      (sum, trackId) => sum + trackHits(pattern, trackId),
      0
    );
    if (chordsHits === 0) {
      suggestions.push({
        severity: "info",
        title: "Chords absents",
        body: "Pose une progression simple pour structurer l'arrangement.",
      });
    }
    if (leadHits === 0) {
      suggestions.push({
        severity: "info",
        title: "Lead absent",
        body: "Ajoute un hook ou un motif lead pour guider la melodie.",
      });
    }
  }

  if (countHits(pattern) === 0) {
      suggestions.push({
        severity: "info",
        title: "Pattern vide",
        body: "Commence par un kick/snare simple puis densifie le groove.",
      });
  }

  return suggestions;
}
