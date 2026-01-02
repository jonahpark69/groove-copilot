export type SampleKey = "kick" | "snare" | "hat" | "perc" | "bass";

export type LoadedSamples = Partial<Record<SampleKey, AudioBuffer>>;
