import type { StyleId } from "@/features/engine/types";

export type SeedAction = "random" | "humanize" | "variants";

export type SeedContext = {
  styleId: StyleId;
  bpm: number;
  steps: 16 | 32;
  patternHits: number;
};

export type ParsedSeed = {
  prefixOk: boolean;
  styleId: string;
  bpm: number;
  steps: 16 | 32;
  patternHits: number;
  action: SeedAction;
  raw: string;
};

export function makeSeedBase(ctx: SeedContext): string {
  return `${ctx.styleId}|${ctx.bpm}|${ctx.steps}|${ctx.patternHits}`;
}

export function makeSeed(
  ctx: SeedContext,
  action: "random" | "humanize" | "variants"
): string {
  return `${makeSeedBase(ctx)}|${action}`;
}

export function seedToClipboardText(seed: string): string {
  return `grooveCopilotSeed:${seed}`;
}

export function parseSeed(input: string): ParsedSeed | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const prefix = "grooveCopilotSeed:";
  const prefixOk = trimmed.startsWith(prefix);
  const raw = prefixOk ? trimmed.slice(prefix.length) : trimmed;
  const parts = raw.split("|");
  if (parts.length !== 5) {
    return null;
  }

  const styleId = parts[0].trim();
  if (!styleId) {
    return null;
  }

  const bpm = Number(parts[1]);
  if (Number.isNaN(bpm)) {
    return null;
  }

  const steps = Number(parts[2]);
  if (steps !== 16 && steps !== 32) {
    return null;
  }

  const patternHits = Number(parts[3]);
  if (!Number.isFinite(patternHits) || patternHits < 0) {
    return null;
  }

  const action = parts[4] as SeedAction;
  if (action !== "random" && action !== "humanize" && action !== "variants") {
    return null;
  }

  return {
    prefixOk,
    styleId,
    bpm,
    steps,
    patternHits,
    action,
    raw,
  };
}
