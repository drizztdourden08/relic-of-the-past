/* @layer renderer-lib @kind logic */
import type { DetectedDevice } from '@shared/types/controls';
import type { InputProfile } from '@shared/types/controls';
import { allowedDevices } from './profile-devices';
import type { PauseListener } from './pause-manager.type';
import { MANUAL_PAUSE } from './pause-manager.constants';

const padVidPid = (v: string): string => v.toLowerCase().padStart(4, '0');

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

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.pausedControllerName = '';
    this.onResume?.();
    this.notify(false, '');
  }

  togglePause(): void {
    if (this.paused) {
      this.resume();
    } else {
      this.pauseFor(MANUAL_PAUSE);
    }
  }

  checkControllerDisconnect(profile: InputProfile | null, connectedKeys: Set<string>, devices: DetectedDevice[]): void {
    if (this.paused || !profile) return;
    const { gamepadKeys } = allowedDevices(profile);
    for (const key of gamepadKeys) {
      if (connectedKeys.has(key)) continue;
      this.pauseFor(deviceNameForKey(profile, devices, key));
      return;
    }
  }

  resumeIfPresent(profile: InputProfile | null, connectedKeys: Set<string>): void {
    if (!this.paused || this.pausedControllerName === MANUAL_PAUSE || !profile) return;
    const { gamepadKeys } = allowedDevices(profile);
    for (const key of gamepadKeys) {
      if (!connectedKeys.has(key)) return;
    }
    this.resume();
  }

  reevaluateForProfile(profile: InputProfile | null, connectedKeys: Set<string>, devices: DetectedDevice[]): void {
    if (!profile || this.pausedControllerName === MANUAL_PAUSE) return;
    const { gamepadKeys } = allowedDevices(profile);
    const missing = [...gamepadKeys].find(key => !connectedKeys.has(key));
    if (missing) {
      this.pauseFor(deviceNameForKey(profile, devices, missing));
    } else if (this.paused) {
      this.resume();
    }
  }

  private pauseFor(name: string): void {
    this.paused = true;
    this.pausedControllerName = name;
    this.onPause?.(true);
    this.notify(true, name);
  }

  private notify(paused: boolean, name: string): void {
    for (const fn of this.listeners) {
      try { fn(paused, name); } catch { continue; }
    }
  }
}

export { PauseManager };
export type { PauseListener };
