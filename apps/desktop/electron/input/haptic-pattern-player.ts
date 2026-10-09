/* @layer electron-main @kind logic */
import { sdl3Source } from './sdl3-source';
import type { VibrateSegment } from './haptic-pattern-player.type';

class HapticPatternPlayer {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  cancel(deviceKey: string): void {
    const timer = this.timers.get(deviceKey);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(deviceKey);
  }

  play(deviceKey: string, pattern: readonly VibrateSegment[], gapMs: number): { ok: boolean; error?: string } {
    this.cancel(deviceKey);
    if (pattern.length === 0) return { ok: true };

    const silentRumbleReachedDevice = sdl3Source.rumble(deviceKey, 0, 0, 0);
    if (!silentRumbleReachedDevice) {
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

export { hapticPatternPlayer };
export type { VibrateSegment };
