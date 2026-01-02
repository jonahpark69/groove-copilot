import type { LoadedSamples, SampleKey } from "@/features/audio/types";

const SAMPLE_FILES: Record<SampleKey, string> = {
  kick: "/samples/kick.wav",
  snare: "/samples/snare.wav",
  hat: "/samples/hat.wav",
  perc: "/samples/perc.wav",
  bass: "/samples/bass.wav",
};

const decode = (ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> =>
  new Promise((resolve, reject) => {
    const result = ctx.decodeAudioData(buffer, resolve, reject);
    if (result && typeof (result as Promise<AudioBuffer>).then === "function") {
      (result as Promise<AudioBuffer>).then(resolve).catch(reject);
    }
  });

export async function loadSamples(ctx: AudioContext): Promise<LoadedSamples> {
  const entries = await Promise.all(
    Object.entries(SAMPLE_FILES).map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.arrayBuffer();
        const buffer = await decode(ctx, data);
        return [key as SampleKey, buffer] as const;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[audio] missing sample: ${url}`, error);
        }
        return null;
      }
    })
  );

  return entries.reduce<LoadedSamples>((acc, entry) => {
    if (entry) {
      acc[entry[0]] = entry[1];
    }
    return acc;
  }, {});
}
