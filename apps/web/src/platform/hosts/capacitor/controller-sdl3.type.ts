/* @layer renderer-other @kind types */
/**
 * Event shapes the ControllerSdl3 Capacitor plugin's "controllerEvent"
 * notification carries. Field-for-field identical to the "added"/"removed"/
 * "state" members of Sdl3Event (apps/desktop/electron/input/native/sdl3/
 * sdl3.type.ts), verified against controller_sdl3_jni.c, which writes this
 * exact JSON, so nothing here needs reshaping before use. Declared locally
 * instead of imported, since that desktop type file lives inside the Electron
 * app's own module graph, outside this app's.
 *
 * Only these three event types exist on Android: the native layer never
 * emits "error", "raw", "joystick", or "gamepad-hold" (those back
 * diagnostics-wizard features with no Android UI path).
 */
import type { ControllerConnectionState, ControllerGamepadType } from '@shared/ipc';

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
  /** Indexed by the SDL_GamepadButton enum, from SDL_GamepadHasButton. */
  hasButton: boolean[];
  /** Indexed by the SDL_GamepadAxis enum, from SDL_GamepadHasAxis. */
  hasAxis: boolean[];
  /** Indexed like `hasButton`. The label this pad prints for that button, or '' when unknown. */
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

export type { Sdl3AddedEvent, Sdl3AndroidEvent, Sdl3RemovedEvent, Sdl3StateEvent };
