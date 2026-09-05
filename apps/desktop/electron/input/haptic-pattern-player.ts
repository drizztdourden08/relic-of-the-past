/* @layer electron-main @kind logic */
/**
 * Turns a timed pattern of {durationMs, intensity} segments into one SDL
 * rumble(low, high, durationMs) call per segment, waiting durationMs + gapMs
 * between. In the main process so timing never drifts under renderer load.
 * A new pattern on a device cancels whatever was still playing on it.
 */
import { sdl3Source } from './sdl3-source';

interface VibrateSegment {
  durationMs: number;
  intensity: number;
}

class HapticPatternPlayer {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  /** Cancel any in-flight pattern for `deviceKey`. */
  cancel(deviceKey: string): void {
    const timer = this.timers.get(deviceKey);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(deviceKey);
  }

  /** Play `pattern` on `deviceKey`, one rumble call per segment, `gapMs` between segments. */
  play(deviceKey: string, pattern: readonly VibrateSegment[], gapMs: number): { ok: boolean; error?: string } {
    this.cancel(deviceKey);
    if (pattern.length === 0) return { ok: true };

    // A silent rumble stops the motor and doubles as an existence check.
    if (!sdl3Source.rumble(deviceKey, 0, 0, 0)) {
      return { ok: false, error: `Device not found or has no rumble: "${deviceKey}"` };
    }

    this.scheduleSegment(deviceKey, pattern, 0, gapMs);
    return { ok: true };
  }

  private scheduleSegment(deviceKey: string, pattern: readonly VibrateSegment[], index: number, gapMs: number): void {
    if (index >= pattern.length) {
      this.timers.delete(deviceKey);
      return;
    }

    const segment = pattern[index];
    const intensity = Math.max(0, Math.min(1, segment.intensity));
    sdl3Source.rumble(deviceKey, intensity, intensity, segment.durationMs);

    const isLast = index === pattern.length - 1;
    const delay = segment.durationMs + (isLast ? 0 : gapMs);
    const timer = setTimeout(() => this.scheduleSegment(deviceKey, pattern, index + 1, gapMs), delay);
    this.timers.set(deviceKey, timer);
  }
}

const hapticPatternPlayer = new HapticPatternPlayer();

export { HapticPatternPlayer, hapticPatternPlayer };
export type { VibrateSegment };
