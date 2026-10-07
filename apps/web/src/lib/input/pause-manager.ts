/* @layer renderer-lib @kind logic */
// Pause/resume state (controller disconnect, manual toggle). Emits events only; audio
// suspend/resume is handled by subscribers.

import type { DetectedDevice } from '@shared/types/controls';
import type { InputProfile } from '@shared/types/controls';
import { allowedDevices } from './profile-devices';

type PauseListener = (paused: boolean, controllerName: string) => void;

const padVidPid = (v: string): string => v.toLowerCase().padStart(4, '0');

/** Human-readable name for a mapped device key, for the disconnect overlay. */
const deviceNameForKey = (profile: InputProfile, devices: DetectedDevice[], key: string): string => {
  const match = devices.find(d => d.vendorId && d.productId && `${padVidPid(d.vendorId)}:${padVidPid(d.productId)}` === key);
  if (match) return match.displayName;
  const assigned = profile.assignedDevice;
  if (assigned && `${padVidPid(assigned.vendorId)}:${padVidPid(assigned.productId)}` === key) return assigned.displayName;
  return 'Controller';
};

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
   * Pause if any device the active profile maps is no longer connected. `connectedKeys` is
   * passed in, not read from the device cache, which lags a disconnect by a refresh cycle.
   * `devices` only names the missing pad.
   */
  checkControllerDisconnect(profile: InputProfile | null, connectedKeys: Set<string>, devices: DetectedDevice[]): void {
    if (this.paused || !profile) return;
    const { gamepadKeys } = allowedDevices(profile);
    for (const key of gamepadKeys) {
      if (connectedKeys.has(key)) continue;
      const name = deviceNameForKey(profile, devices, key);
      this.paused = true;
      this.pausedControllerName = name;
      this.onPause?.(true);
      this.notify(true, name);
      return;
    }
  }

  /** Resume from a disconnect pause only once EVERY mapped device is back, so an unrelated controller can't dismiss the overlay. Never touches a manual pause. */
  resumeIfPresent(profile: InputProfile | null, connectedKeys: Set<string>): void {
    if (!this.paused || this.pausedControllerName === 'Manual pause' || !profile) return;
    const { gamepadKeys } = allowedDevices(profile);
    for (const key of gamepadKeys) {
      if (!connectedKeys.has(key)) return; // still missing at least one mapped pad
    }
    this.resume();
  }

  /** Re-evaluate after the ACTIVE PROFILE changes: pause (or re-name the pause) if the new profile's controller is missing, resume if present. Leaves a manual pause untouched. */
  reevaluateForProfile(profile: InputProfile | null, connectedKeys: Set<string>, devices: DetectedDevice[]): void {
    if (!profile || this.pausedControllerName === 'Manual pause') return;
    const { gamepadKeys } = allowedDevices(profile);
    const missing = [...gamepadKeys].find(key => !connectedKeys.has(key));
    if (missing) {
      const name = deviceNameForKey(profile, devices, missing);
      this.paused = true;
      this.pausedControllerName = name;
      this.onPause?.(true);
      this.notify(true, name);
    } else if (this.paused) {
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
