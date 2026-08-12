/* @layer renderer-lib @kind logic */
/**
 * Raw Input Dispatcher — rising-edge detection and event emission
 * for any button/key/axis press on any device. Used by rebinding UI,
 * input tester, etc.
 */

import type { InputBinding } from '@shared/types/controls';
import { resolveAxisPressThreshold } from './axis-press-threshold';

/** Raw input event — fired when any button/key/axis is pressed on any device */
interface RawInputEvent {
  binding: InputBinding;
  sourceDeviceKey: string;
  vendorId: string | null;
  productId: string | null;
}
type RawInputListener = (event: RawInputEvent) => void;

class RawInputDispatcher {
  private listeners = new Set<RawInputListener>();

  // Previous frame state for rising-edge detection
  private prevHidButtons = new Map<string, boolean[]>();
  private prevHidAxes = new Map<string, ('+' | '-' | null)[]>();

  get hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  subscribe(listener: RawInputListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Emit a raw input event (keyboard presses call this directly) */
  emit(binding: InputBinding, sourceDeviceKey: string, vendorId: string | null = null, productId: string | null = null): void {
    if (this.listeners.size === 0) return;
    const event: RawInputEvent = { binding, sourceDeviceKey, vendorId, productId };
    for (const fn of this.listeners) {
      try { fn(event); } catch { /* ignore */ }
    }
  }

  /** Emit rising-edge events for HID buttons/axes (called each frame) */
  emitHidEvents(hidStates: Map<string, { buttons: boolean[]; axes: number[] }>): void {
    for (const [deviceKey, state] of hidStates) {
      const prev = this.prevHidButtons.get(deviceKey) ?? [];
      const parts = deviceKey.split(':');
      const vid = parts[0] ? parts[0].toLowerCase().padStart(4, '0') : null;
      const pid = parts[1] ? parts[1].toLowerCase().padStart(4, '0') : null;
      for (let i = 0; i < state.buttons.length; i++) {
        if (state.buttons[i] && !prev[i]) {
          this.emit({ type: 'gamepad-button', index: i }, deviceKey, vid, pid);
        }
      }
      // Axes — rising-edge
      const prevAxes = this.prevHidAxes.get(deviceKey) ?? [];
      const currAxes: ('+' | '-' | null)[] = [];
      for (let i = 0; i < state.axes.length; i++) {
        const val = state.axes[i];
        const threshold = resolveAxisPressThreshold(i, deviceKey);
        const dir: '+' | '-' | null = Math.abs(val) > threshold ? (val > 0 ? '+' : '-') : null;
        currAxes[i] = dir;
        if (dir !== null && dir !== prevAxes[i]) {
          this.emit(
            { type: 'gamepad-axis', axisIndex: i, direction: dir },
            deviceKey, vid, pid,
          );
        }
      }
      this.prevHidButtons.set(deviceKey, [...state.buttons]);
      this.prevHidAxes.set(deviceKey, currAxes);
    }
  }

  /** Clean up stale device state on disconnect */
  removeDevice(deviceKey: string): void {
    this.prevHidButtons.delete(deviceKey);
    this.prevHidAxes.delete(deviceKey);
  }
}

export { RawInputDispatcher };
export type { RawInputEvent, RawInputListener };
