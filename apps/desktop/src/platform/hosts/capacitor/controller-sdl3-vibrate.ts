/* @layer renderer-other @kind logic */
import type { VibrateResult, VibrateStep } from '@shared/platform';
import type { RumbleFn } from './controller-sdl3.type';

class Sdl3VibratePatternPlayer {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly rumble: RumbleFn) {}

  cancel(deviceKey: string): void {
    const timer = this.timers.get(deviceKey);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(deviceKey);
  }

  async play(deviceKey: string, pattern: readonly VibrateStep[], gapMs: number): Promise<VibrateResult> {
    this.cancel(deviceKey);
    if (pattern.length === 0) return { ok: true };

    void this.rumble(deviceKey, 0, 0, 0);

    this.scheduleSegment(deviceKey, pattern, 0, gapMs);
    return { ok: true };
  }

  private scheduleSegment(deviceKey: string, pattern: readonly VibrateStep[], index: number, gapMs: number): void {
    if (index >= pattern.length) {
      this.timers.delete(deviceKey);
      return;
    }

    const segment = pattern[index];
    const intensity = Math.max(0, Math.min(1, segment.intensity));
    this.rumble(deviceKey, intensity, intensity, segment.durationMs).catch(() => {});

    const isLast = index === pattern.length - 1;
    const delay = segment.durationMs + (isLast ? 0 : gapMs);
    const timer = setTimeout(() => this.scheduleSegment(deviceKey, pattern, index + 1, gapMs), delay);
    this.timers.set(deviceKey, timer);
  }
}

export { Sdl3VibratePatternPlayer };
