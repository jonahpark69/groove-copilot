export type StyleId =
  | "trap"
  | "drill"
  | "boombap"
  | "pop"
  | "kpop"
  | "afrobeats"
  | "reggaeton"
  | "electro";

export type TrackId =
  | "kick"
  | "snare"
  | "clap"
  | "hat"
  | "ohat"
  | "shaker"
  | "perc"
  | "tom"
  | "bass"
  | "sub"
  | "808"
  | "chords"
  | "lead"
  | "pad"
  | "fx";

export type TrackRole =
  | "foundation"
  | "backbeat"
  | "groove"
  | "texture"
  | "bass"
  | "harmony"
  | "melody"
  | "fx";

export type StyleTrack = {
  id: TrackId;
  name: string;
  role: TrackRole;
};

export type BpmRange = {
  min: number;
  max: number;
  default: number;
};

export type FxPack = {
  name: string;
  items: string[];
};

export type CoachPack = {
  instrumentsCore: string[];
  instrumentsOptional: string[];
  fxPacks: FxPack[];
  mixTips: string[];
  glossaryTags: string[];
};

export type StructureSection = {
  id: "intro" | "verse" | "prechorus" | "chorus" | "bridge" | "drop" | "break" | "outro";
  bars: number;
  notes?: string;
};

export type StyleStructure = {
  timeSignature: "4/4";
  sectionOrder: StructureSection[];
};

export type SimilarTrack = {
  title: string;
  artist: string;
  year?: number;
  tags?: string[];
};

export type StylePreset = {
  id: StyleId;
  name: string;
  bpmRange: BpmRange;
  stepsDefault: 16 | 32;
  tracks: StyleTrack[];
  coach: CoachPack;
  structure: StyleStructure;
  similarTracks: SimilarTrack[];
};
