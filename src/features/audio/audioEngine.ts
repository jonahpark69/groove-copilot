import type { StyleTrack } from "@/features/engine/types";
import { loadSamples } from "@/features/audio/sampleLoader";
import type { LoadedSamples, SampleKey } from "@/features/audio/types";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

export function trackToSampleKey(track: StyleTrack): SampleKey | null {
  const roleMap: Partial<Record<StyleTrack["role"], SampleKey>> = {
    foundation: "kick",
    backbeat: "snare",
    groove: "hat",
    texture: "perc",
    bass: "bass",
  };

  const fromRole = roleMap[track.role];
  if (fromRole) {
    return fromRole;
  }

  const name = `${track.id} ${track.name}`.toLowerCase();
  if (name.includes("kick") || name.includes("bd")) return "kick";
  if (name.includes("snare") || name.includes("clap")) return "snare";
  if (name.includes("hat") || name.includes("hi-hat") || name.includes("hihat"))
    return "hat";
  if (name.includes("perc") || name.includes("percussion") || name.includes("rim"))
    return "perc";
  if (name.includes("808") || name.includes("bass") || name.includes("sub"))
    return "bass";
  return null;
}

export class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  samples: LoadedSamples = {};
  private noiseBuffer: AudioBuffer | null = null;
  private initialized = false;

  isReady(): boolean {
    return this.initialized && !!this.ctx && !!this.master;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.samples = await loadSamples(ctx);
    this.initialized = true;
  }

  setMaster(volume: number) {
    if (this.master) {
      this.master.gain.value = clamp(volume);
    }
  }

  playHit(key: SampleKey, when: number, velocity: number) {
    if (!this.ctx || !this.master) {
      return;
    }
    const vol = clamp(velocity);
    const sample = this.samples[key];
    if (sample) {
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      gain.gain.value = vol;
      source.buffer = sample;
      source.connect(gain);
      gain.connect(this.master);
      source.start(when);
      return;
    }
    this.playFallback(key, when, vol);
  }

  stopAll() {
    if (this.ctx) {
      this.ctx.close();
    }
    this.ctx = null;
    this.master = null;
    this.samples = {};
    this.noiseBuffer = null;
    this.initialized = false;
  }

  private playFallback(key: SampleKey, when: number, velocity: number) {
    if (!this.ctx || !this.master) {
      return;
    }
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
    gain.connect(this.master);

    if (key === "kick" || key === "bass") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const startFreq = key === "kick" ? 120 : 70;
      const endFreq = key === "kick" ? 50 : 50;
      osc.frequency.setValueAtTime(startFreq, when);
      osc.frequency.exponentialRampToValueAtTime(endFreq, when + 0.2);
      osc.connect(gain);
      osc.start(when);
      osc.stop(when + 0.2);
      return;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = key === "hat" ? 6000 : 1200;
    noise.connect(filter);
    filter.connect(gain);
    const duration = key === "hat" ? 0.08 : 0.15;
    noise.start(when);
    noise.stop(when + duration);
  }

  private getNoiseBuffer(): AudioBuffer {
    if (!this.ctx) {
      throw new Error("Audio context not ready");
    }
    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }
    const duration = 0.2;
    const buffer = this.ctx.createBuffer(
      1,
      Math.floor(this.ctx.sampleRate * duration),
      this.ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }
}
