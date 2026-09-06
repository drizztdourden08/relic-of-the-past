/* @layer renderer-other @kind logic */
/**
 * Capacitor bridge to the ControllerSdl3 native plugin (see
 * apps/mobile/android/.../controllersdl3/ControllerSdl3Plugin.java): start
 * the SDL3 gamepad subsystem, stop it, rumble a device by its SDL joystick
 * id, and listen for the "controllerEvent" notification each added/removed/
 * state event arrives as (see controller-sdl3.type.ts).
 *
 * `start()` resolves `{ ok: false }` instead of throwing when the native
 * library can't load (wrong ABI, missing .so) or SDL_Init fails: callers
 * treat that the same way a desktop build with no SDL3 addon behaves:
 * report no controllers, do not crash.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type { Sdl3AndroidEvent } from './controller-sdl3.type';

interface ControllerSdl3PluginApi {
  start: () => Promise<{ ok: boolean }>;
  stop: () => Promise<void>;
  rumble: (opts: { id: number; low: number; high: number; durationMs: number }) => Promise<{ ok: boolean }>;
  addListener: (event: 'controllerEvent', cb: (event: Sdl3AndroidEvent) => void) => Promise<PluginListenerHandle>;
}

const isControllerSdl3Available = (): boolean => Capacitor.isPluginAvailable('ControllerSdl3');

let cached: ControllerSdl3PluginApi | null = null;
const controllerSdl3Plugin = (): ControllerSdl3PluginApi => {
  cached ??= registerPlugin<ControllerSdl3PluginApi>('ControllerSdl3');
  return cached;
};

/** Subscribes to every native controller event; returns a synchronous unsubscribe
 *  (addListener itself resolves async, which is the bridge idiom for plugin listeners). */
const onControllerSdl3Event = (cb: (event: Sdl3AndroidEvent) => void): (() => void) => {
  const handle = controllerSdl3Plugin().addListener('controllerEvent', cb);
  return () => { handle.then((h) => h.remove()).catch(() => {}); };
};

export { controllerSdl3Plugin, isControllerSdl3Available, onControllerSdl3Event };
export type { ControllerSdl3PluginApi };
