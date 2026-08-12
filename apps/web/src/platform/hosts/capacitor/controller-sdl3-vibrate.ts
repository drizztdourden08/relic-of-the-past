/* @layer renderer-other @kind logic */
/**
 * Turns a timed pattern of {durationMs, intensity} segments into a sequence
 * of rumble calls, one per segment, `gapMs` between them: the same
 * sequencing apps/desktop/electron/input/haptic-pattern-player.ts runs in
 * the Electron main process. Android has no separate main process (this
 * plugin runs entirely inside the app's own WebView), so the timing lives
 * here instead, in the renderer, driven by plain setTimeout. Starting a new
 * pattern on a device cancels whatever was still playing on it, so
 * overlapping haptic events never interleave on one motor.
 */
import type { VibrateResult, VibrateStep } from '@shared/platform';

type RumbleFn = (deviceKey: string, low: number, high: number, durationMs: number) => Promise<boolean>;

class Sdl3VibratePatternPlayer {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly rumble: RumbleFn) {}

  /** Cancel any in-flight pattern for `deviceKey`. */
  cancel(deviceKey: string): void {
    const timer = this.timers.get(deviceKey);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(deviceKey);
  }

  /** Play `pattern` on `deviceKey`, one rumble call per segment, `gapMs` between segments. */
  async play(deviceKey: string, pattern: readonly VibrateStep[], gapMs: number): Promise<VibrateResult> {
    this.cancel(deviceKey);
    if (pattern.length === 0) return { ok: true };

    // Silences whatever the motor was doing, and nothing more. Its result is
    // deliberately ignored: a backend that declines a zero-length rumble would
    // otherwise cancel the whole pattern before a single real segment ran, and
    // whether the device exists is already known to the caller that resolves
    // its id.
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
