/* @layer renderer-other @kind types */
import type { PluginListenerHandle } from '@capacitor/core';
import type { ControllerConnectionState, ControllerGamepadType, DeviceEntry } from '@shared/ipc';

interface Sdl3AddedEvent {
  type: 'added';
  id: number;
  name: string;
  vendorId: number;
  productId: number;
  guid: string;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

interface Sdl3RemovedEvent {
  type: 'removed';
  id: number;
}

interface Sdl3StateEvent {
  type: 'state';
  id: number;
  buttons: boolean[];
  axes: number[];
}

type Sdl3AndroidEvent = Sdl3AddedEvent | Sdl3RemovedEvent | Sdl3StateEvent;

interface ControllerSdl3PluginApi {
  start: () => Promise<{ ok: boolean }>;
  stop: () => Promise<void>;
  rumble: (opts: { id: number; low: number; high: number; durationMs: number }) => Promise<{ ok: boolean }>;
  addListener: (event: 'controllerEvent', cb: (event: Sdl3AndroidEvent) => void) => Promise<PluginListenerHandle>;
}

interface LiveDevice {
  deviceKey: string;
  sdlId: number;
  name: string;
  vendorId: number;
  productId: number;
  guid: string;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

type StateListener = (deviceKey: string, buttons: boolean[], axes: number[]) => void;
type DevicesListener = (devices: DeviceEntry[]) => void;
type RemovedListener = (deviceKey: string) => void;
type RumbleFn = (deviceKey: string, low: number, high: number, durationMs: number) => Promise<boolean>;

export type {
  ControllerSdl3PluginApi, DevicesListener, LiveDevice, RemovedListener, RumbleFn,
  Sdl3AddedEvent, Sdl3AndroidEvent, Sdl3RemovedEvent, Sdl3StateEvent, StateListener,
};
