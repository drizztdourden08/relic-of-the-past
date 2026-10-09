/* @layer renderer-lib @kind logic */
import type { InputBinding } from '@shared/types/controls';
import { resolveAxisPressThreshold } from './axis-press-threshold';
import type { AxisDirection, RawInputEvent, RawInputListener } from './raw-input-dispatcher.type';

const paddedPart = (part: string | undefined): string | null => (part ? part.toLowerCase().padStart(4, '0') : null);

class RawInputDispatcher {
  private listeners = new Set<RawInputListener>();
  private prevHidButtons = new Map<string, boolean[]>();
  private prevHidAxes = new Map<string, AxisDirection[]>();

  get hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  subscribe(listener: RawInputListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(binding: InputBinding, sourceDeviceKey: string, vendorId: string | null = null, productId: string | null = null): void {
    if (this.listeners.size === 0) return;
    const event: RawInputEvent = { binding, sourceDeviceKey, vendorId, productId };
    for (const fn of this.listeners) {
      try { fn(event); } catch { continue; }
    }
  }

  emitHidEvents(hidStates: Map<string, { buttons: boolean[]; axes: number[] }>): void {
    for (const [deviceKey, state] of hidStates) {
      const prev = this.prevHidButtons.get(deviceKey) ?? [];
      const parts = deviceKey.split(':');
      const vid = paddedPart(parts[0]);
      const pid = paddedPart(parts[1]);
      for (let i = 0; i < state.buttons.length; i++) {
        if (state.buttons[i] && !prev[i]) {
          this.emit({ type: 'gamepad-button', index: i }, deviceKey, vid, pid);
        }
      }
      const prevAxes = this.prevHidAxes.get(deviceKey) ?? [];
      const currAxes: AxisDirection[] = [];
      for (let i = 0; i < state.axes.length; i++) {
        const val = state.axes[i];
        const threshold = resolveAxisPressThreshold(i, deviceKey);
        const dir: AxisDirection = Math.abs(val) > threshold ? (val > 0 ? '+' : '-') : null;
        currAxes[i] = dir;
        if (dir !== null && dir !== prevAxes[i]) {
          this.emit({ type: 'gamepad-axis', axisIndex: i, direction: dir }, deviceKey, vid, pid);
        }
      }
      this.prevHidButtons.set(deviceKey, [...state.buttons]);
      this.prevHidAxes.set(deviceKey, currAxes);
    }
  }

  removeDevice(deviceKey: string): void {
    this.prevHidButtons.delete(deviceKey);
    this.prevHidAxes.delete(deviceKey);
  }
}

export { RawInputDispatcher };
export type { RawInputEvent, RawInputListener };
