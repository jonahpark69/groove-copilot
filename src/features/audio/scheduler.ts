import type { Pattern } from "@/features/engine/pattern";
import type { AccentMap } from "@/features/engine/accent";
import type { StylePreset } from "@/features/engine/types";

type SchedulerState = {
  bpm: number;
  steps: 16 | 32;
  pattern: Pattern;
  accents?: AccentMap;
  preset: StylePreset;
};

type SchedulerArgs = {
  getState: () => SchedulerState;
  getNow: () => number;
  onStep: (stepIndex: number, time: number) => void;
};

export function createScheduler(args: SchedulerArgs) {
  const lookahead = 0.025;
  const scheduleAheadTime = 0.1;
  let timer: ReturnType<typeof setInterval> | null = null;
  let nextNoteTime = 0;
  let currentStep = 0;
  let running = false;

  const tick = () => {
    const now = args.getNow();
    while (nextNoteTime < now + scheduleAheadTime) {
      args.onStep(currentStep, nextNoteTime);
      const { bpm, steps } = args.getState();
      const beat = 60 / Math.max(1, bpm);
      const stepDuration = steps === 32 ? beat / 8 : beat / 4;
      nextNoteTime += stepDuration;
      currentStep = (currentStep + 1) % steps;
    }
  };

  const start = () => {
    if (running) {
      return;
    }
    running = true;
    currentStep = 0;
    nextNoteTime = args.getNow() + 0.05;
    timer = setInterval(tick, lookahead * 1000);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    running = false;
    currentStep = 0;
  };

  return {
    start,
    stop,
    isRunning: () => running,
  };
}
