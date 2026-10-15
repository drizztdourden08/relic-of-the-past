/* @layer renderer-lib @kind logic */
import type { InputBinding } from '@rotp/game-data';
import { axisDirection } from './axis-direction';
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

  private emitButtonEdges(deviceKey: string, buttons: readonly boolean[], vid: string | null, pid: string | null): void {
    const prev = this.prevHidButtons.get(deviceKey) ?? [];
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] && !prev[i]) {
        this.emit({ type: 'gamepad-button', index: i }, deviceKey, vid, pid);
      }
    }
  }

  private emitAxisEdges(deviceKey: string, axes: readonly number[], vid: string | null, pid: string | null): AxisDirection[] {
    const prevAxes = this.prevHidAxes.get(deviceKey) ?? [];
    const currAxes: AxisDirection[] = [];
    for (const [i, val] of axes.entries()) {
      const dir = axisDirection(val, resolveAxisPressThreshold(i, deviceKey));
      currAxes[i] = dir;
      if (dir !== null && dir !== prevAxes[i]) {
        this.emit({ type: 'gamepad-axis', axisIndex: i, direction: dir }, deviceKey, vid, pid);
      }
    }
    return currAxes;
  }

  emitHidEvents(hidStates: Map<string, { buttons: boolean[]; axes: number[] }>): void {
    for (const [deviceKey, state] of hidStates) {
      const parts = deviceKey.split(':');
      const vid = paddedPart(parts[0]);
      const pid = paddedPart(parts[1]);
      this.emitButtonEdges(deviceKey, state.buttons, vid, pid);
      const currAxes = this.emitAxisEdges(deviceKey, state.axes, vid, pid);
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
export type { RawInputListener };
