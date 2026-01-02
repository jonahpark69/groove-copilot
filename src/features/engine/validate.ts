import type { StylePreset } from "@/features/engine/types";

export type ValidationIssue = {
  presetId: string;
  path: string;
  message: string;
};

const DEFAULT_MIN_BPM = 60;
const DEFAULT_MAX_BPM = 180;

const asArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

export function sanitizePreset(preset: StylePreset): StylePreset {
  const min =
    typeof preset.bpmRange?.min === "number"
      ? preset.bpmRange.min
      : DEFAULT_MIN_BPM;
  const max =
    typeof preset.bpmRange?.max === "number"
      ? preset.bpmRange.max
      : DEFAULT_MAX_BPM;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const rawDefault =
    typeof preset.bpmRange?.default === "number"
      ? preset.bpmRange.default
      : safeMin;
  const safeDefault = Math.min(Math.max(rawDefault, safeMin), safeMax);

  const safeCoach = preset.coach ?? {
    instrumentsCore: [],
    instrumentsOptional: [],
    fxPacks: [],
    mixTips: [],
    glossaryTags: [],
  };

  return {
    ...preset,
    bpmRange: {
      min: safeMin,
      max: safeMax,
      default: safeDefault,
    },
    stepsDefault: preset.stepsDefault === 32 ? 32 : 16,
    coach: {
      ...safeCoach,
      instrumentsCore: asArray(safeCoach.instrumentsCore),
      instrumentsOptional: asArray(safeCoach.instrumentsOptional),
      fxPacks: asArray(safeCoach.fxPacks),
      mixTips: asArray(safeCoach.mixTips),
      glossaryTags: asArray(safeCoach.glossaryTags),
    },
    similarTracks: asArray(preset.similarTracks),
  };
}

export function validatePresets(presets: StylePreset[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  const pushIssue = (presetId: string, path: string, message: string) => {
    issues.push({ presetId, path, message });
  };

  presets.forEach((preset, index) => {
    const presetId = preset?.id ?? `index-${index}`;

    if (!preset?.id) {
      pushIssue(presetId, "id", "Missing id.");
    } else if (ids.has(preset.id)) {
      pushIssue(preset.id, "id", "Duplicate id.");
    } else {
      ids.add(preset.id);
    }

    if (!preset?.name) {
      pushIssue(presetId, "name", "Missing name.");
    }

    if (!preset?.bpmRange) {
      pushIssue(presetId, "bpmRange", "Missing bpmRange.");
    } else {
      const { min, max, default: bpmDefault } = preset.bpmRange;
      if (typeof min !== "number" || typeof max !== "number") {
        pushIssue(presetId, "bpmRange", "min/max must be numbers.");
      } else if (min >= max) {
        pushIssue(presetId, "bpmRange", "min must be < max.");
      }
      if (typeof bpmDefault !== "number") {
        pushIssue(presetId, "bpmRange.default", "default must be a number.");
      } else if (
        typeof min === "number" &&
        typeof max === "number" &&
        (bpmDefault < min || bpmDefault > max)
      ) {
        pushIssue(
          presetId,
          "bpmRange.default",
          "default must be between min and max."
        );
      }
    }

    if (preset?.stepsDefault !== 16 && preset?.stepsDefault !== 32) {
      pushIssue(presetId, "stepsDefault", "stepsDefault must be 16 or 32.");
    }

    if (!Array.isArray(preset?.tracks) || preset.tracks.length === 0) {
      pushIssue(presetId, "tracks", "Tracks array is empty.");
    } else {
      const trackIds = new Set<string>();
      preset.tracks.forEach((track, trackIndex) => {
        if (!track?.id) {
          pushIssue(presetId, `tracks[${trackIndex}].id`, "Missing track id.");
        } else if (trackIds.has(track.id)) {
          pushIssue(presetId, `tracks[${trackIndex}].id`, "Duplicate track id.");
        } else {
          trackIds.add(track.id);
        }
        if (!track?.role) {
          pushIssue(
            presetId,
            `tracks[${trackIndex}].role`,
            "Missing track role."
          );
        }
      });
    }

    const sectionOrder = preset?.structure?.sectionOrder;
    if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
      pushIssue(
        presetId,
        "structure.sectionOrder",
        "Section order must not be empty."
      );
    } else {
      sectionOrder.forEach((section, sectionIndex) => {
        if (typeof section?.bars !== "number" || section.bars <= 0) {
          pushIssue(
            presetId,
            `structure.sectionOrder[${sectionIndex}].bars`,
            "Bars must be > 0."
          );
        }
      });
    }

    if (!Array.isArray(preset?.coach?.instrumentsCore)) {
      pushIssue(
        presetId,
        "coach.instrumentsCore",
        "instrumentsCore must be an array."
      );
    }
    if (!Array.isArray(preset?.coach?.instrumentsOptional)) {
      pushIssue(
        presetId,
        "coach.instrumentsOptional",
        "instrumentsOptional must be an array."
      );
    }
    if (!Array.isArray(preset?.coach?.fxPacks)) {
      pushIssue(presetId, "coach.fxPacks", "fxPacks must be an array.");
    }
    if (!Array.isArray(preset?.coach?.mixTips)) {
      pushIssue(presetId, "coach.mixTips", "mixTips must be an array.");
    }

    if (!Array.isArray(preset?.similarTracks)) {
      pushIssue(
        presetId,
        "similarTracks",
        "similarTracks must be an array."
      );
    }
  });

  return issues;
}
