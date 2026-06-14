/* @layer renderer-lib @kind logic */
/**
 * Pause Manager — handles game pause/resume state triggered by
 * controller disconnect, manual toggle, or other sources.
 * Emits events only — audio suspend/resume is handled by subscribers.
 */

import type { DetectedDevice } from '@shared/types/controls';
import type { InputProfile } from '@shared/types/controls';

type PauseListener = (paused: boolean, controllerName: string) => void;

class PauseManager {
  private paused = false;
  private pausedControllerName = '';
  private listeners = new Set<PauseListener>();

  // External callbacks (wired by InputManager)
  onPause: ((zeroBitmask: boolean) => void) | null = null;
  onResume: (() => void) | null = null;

  get isPaused(): boolean {
    return this.paused;
  }

  get controllerName(): string {
    return this.pausedControllerName;
  }

  subscribe(listener: PauseListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Resume from controller-disconnect pause.
   */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.pausedControllerName = '';
    this.onResume?.();
    this.notify(false, '');
  }

  /**
   * Toggle pause (F10 or manual).
   */
  togglePause(): void {
    if (this.paused) {
      this.resume();
    } else {
      this.paused = true;
      this.pausedControllerName = 'Manual pause';
      this.onPause?.(true);
      this.notify(true, 'Manual pause');
    }
  }

  /**
   * Check if the assigned controller is still connected; pause if not.
   */
  checkControllerDisconnect(profile: InputProfile | null, devices: DetectedDevice[]): void {
    if (this.paused) return;
    const assigned = profile?.assignedDevice;
    if (assigned && assigned.deviceFamily !== 'keyboard') {
      const stillConnected = devices.some(
        d => d.vendorId === assigned.vendorId && d.productId === assigned.productId && d.connected
      );
      if (!stillConnected) {
        this.paused = true;
        this.pausedControllerName = assigned.displayName;
        this.onPause?.(true);
        this.notify(true, assigned.displayName);
      }
    }
  }

  /**
   * Auto-resume if paused due to controller disconnect (not manual).
   */
  autoResume(): void {
    if (this.paused && this.pausedControllerName !== 'Manual pause') {
      this.resume();
    }
  }

  private notify(paused: boolean, name: string): void {
    for (const fn of this.listeners) {
      try { fn(paused, name); } catch { /* ignore */ }
    }
  }
}

export { PauseManager };
export type { PauseListener };
