/* @layer electron-main @kind logic */
/**
 * Loader and typed wrapper for the SDL3 gamepad Node-API addon.
 *
 * Loaded with a runtime require rather than a static import, and only on
 * first use, so a missing or unbuilt addon degrades to "this transport is
 * unavailable" instead of taking the app down at startup — callers fall back
 * to the existing HID input path.
 *
 * Pure transport: this module does not interpret button/axis data or map it
 * to any device or SNES layout. It only loads the addon and forwards calls.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { HidDeviceInfo, JoystickInfo, RawCaptureResult, Sdl3Event, Sdl3EventCallback, Sdl3Input } from './sdl3.type';
import { SDL_AXIS_NAMES, SDL_BUTTON_NAMES } from './sdl3.type';

let addon: Sdl3Input | null = null;
let attempted = false;

/** Where this module actually lives on disk relative to the repo root, for
 * the two dev-path candidates below: electron-vite bundles the main
 * process to `dist/electron/`, so `__dirname` there is two levels below the
 * repo root and never contains a `prebuilds/` or `build/` of its own. */
const SOURCE_TREE_RELATIVE = 'apps/desktop/electron/input/native/sdl3/prebuilds';

/** Every path this addon could live at, in priority order: the packaged
 * app's resources dir, then the real source-tree prebuilt (bundled main
 * process, and a cwd-based fallback for the same layout), then a local dev
 * build next to this module (unbundled dev run). */
const addonCandidates = (): string[] => {
  const platformArch = `${process.platform}-${process.arch}`;
  return [
    // electron-builder ships this addon as extraResources (never asar-packed,
    // and independent of wherever the main-process bundle itself ends up),
    // see scripts/build/electron-builder.config.js. Only set once packaged.
    ...(process.resourcesPath ? [join(process.resourcesPath, 'sdl3', platformArch, 'sdl3_input.node')] : []),
    // Bundled dev/prod main process: dist/electron/main.js, two levels below
    // the repo root, resolve back to the addon's real home in the source
    // tree rather than a path relative to the bundle output.
    join(__dirname, '..', '..', SOURCE_TREE_RELATIVE, platformArch, 'sdl3_input.node'),
    // electron-vite dev runs with cwd at the repo root; belt-and-braces
    // fallback in case __dirname ever points somewhere else.
    join(process.cwd(), SOURCE_TREE_RELATIVE, platformArch, 'sdl3_input.node'),
    join(__dirname, 'prebuilds', platformArch, 'sdl3_input.node'),
    join(__dirname, 'build', 'Release', 'sdl3_input.node')
  ];
};

/** Locate the compiled addon: the first candidate from addonCandidates that exists on disk. */
const resolveAddonPath = (): string | null => {
  return addonCandidates().find(candidate => existsSync(candidate)) ?? null;
};

/** Load the addon once and cache the result (including failure). */
const loadAddon = (): Sdl3Input | null => {
  if (attempted) return addon;
  attempted = true;
  const addonPath = resolveAddonPath();
  if (!addonPath) {
    console.log('[SDL3] native addon not found, controller transport disabled. Tried:');
    addonCandidates().forEach(candidate => console.log(`  ${candidate}`));
    return addon;
  }
  try {
    addon = require(addonPath) as Sdl3Input;
  } catch (e) {
    console.log(`[SDL3] failed to load native addon: ${e instanceof Error ? e.message : String(e)}`);
    addon = null;
  }
  return addon;
};

/** Whether the native addon loaded successfully. Check before relying on the transport. */
const isAvailable = (): boolean => loadAddon() !== null;

/** Start SDL3 gamepad polling; events are delivered to `callback` until `stop()`. No-op when unavailable. */
const start = (callback: Sdl3EventCallback): void => {
  loadAddon()?.start(callback);
};

/** Stop SDL3 gamepad polling. No-op when unavailable. */
const stop = (): void => {
  loadAddon()?.stop();
};

/** Send a rumble command to device `id`. Returns false when unavailable or rejected. */
const rumble = (id: number, low: number, high: number, durationMs: number): boolean => {
  return loadAddon()?.rumble(id, low, high, durationMs) ?? false;
};

/** Register an SDL gamepad mapping string. Returns false when unavailable or invalid. */
const addMapping = (mappingString: string): boolean => {
  return loadAddon()?.addMapping(mappingString) ?? false;
};

/** Load mappings from a gamecontrollerdb-style file. Returns the count added, 0 when unavailable. */
const addMappingsFromFile = (path: string): number => {
  return loadAddon()?.addMappingsFromFile(path) ?? 0;
};

/**
 * Every HID gamepad-like device the OS reports, whether or not SDL could
 * claim it — this is how the app tells "connected but held by another
 * application" apart from "not plugged in". Returns an empty array when
 * unavailable.
 */
const enumerateHid = (): HidDeviceInfo[] => {
  return loadAddon()?.enumerateHid() ?? [];
};

/**
 * Tear the gamepad subsystem down and back up so SDL re-probes devices it
 * cached as unavailable at startup (e.g. one freed by another application
 * since). Fire-and-forget — watch for the resulting `removed`/`added`
 * events on the `start()` callback. No-op when unavailable.
 */
const rescan = (): void => {
  loadAddon()?.rescan();
};

/**
 * Closes every open gamepad+joystick and quits the gamepad subsystem so a
 * raw HID open on the same device can succeed. The SDL thread and
 * SDL_hid_* stay alive; only the gamepad backend's exclusive libusb claim
 * is released. Fire-and-forget — watch for the resulting `removed` events
 * and a `gamepad-hold` event with `held: true` on the `start()` callback.
 * Returns false when unavailable.
 */
const releaseGamepads = (): boolean => {
  return loadAddon()?.releaseGamepads() ?? false;
};

/**
 * Restores the gamepad subsystem after `releaseGamepads`, replaying every
 * mapping this addon has added. Sufficient on its own, even without a
 * prior `releaseGamepads` call. SDL re-synthesizes `added` events for
 * whatever it can reclaim, and a `gamepad-hold` event with `held: false`
 * follows. Returns false when unavailable.
 */
const restoreGamepads = (): boolean => {
  return loadAddon()?.restoreGamepads() ?? false;
};

/** The linked SDL3 version string, or null when unavailable. */
const version = (): string | null => {
  return loadAddon()?.version() ?? null;
};

/**
 * Open a diagnostic raw HID capture on `vendorId`/`productId`. Only one
 * capture runs at a time, so a second call closes whatever was open first.
 * Bytes read while capturing arrive as `raw` events on the `start()`
 * callback. Expect `reason: 'unavailable-exclusive'` for a controller SDL
 * already holds through libusb: that is not a failure to work around, it
 * is the case this exists to explain. Returns a generic error result when unavailable.
 */
const startRawCapture = (vendorId: number, productId: number): RawCaptureResult => {
  return (
    loadAddon()?.startRawCapture(vendorId, productId) ?? {
      success: false,
      reason: 'error',
      message: 'native addon unavailable'
    }
  );
};

/** Close the raw HID capture, if any. No-op when unavailable. */
const stopRawCapture = (): void => {
  loadAddon()?.stopRawCapture();
};

/**
 * Start a joystick-level capture on `joystickId`: the raw button/axis/hat
 * indices a gamecontrollerdb mapping line is written in, unlike the fixed
 * SDL gamepad layout `start()` reports. Samples arrive as `joystick` events
 * on the `start()` callback, emitted only when something changes. Returns
 * false when unavailable.
 */
const startJoystickCapture = (joystickId: number): boolean => {
  return loadAddon()?.startJoystickCapture(joystickId) ?? false;
};

/** Stop the joystick-level capture, if any. No-op when unavailable. */
const stopJoystickCapture = (): void => {
  loadAddon()?.stopJoystickCapture();
};

/**
 * Every joystick SDL currently has open, whether or not it also has a
 * gamepad mapping. This is how a controller with no mapping becomes
 * visible at all, unlike `start()`'s gamepad-only `added`/`removed` events.
 * Returns an empty array when unavailable.
 */
const listJoysticks = (): JoystickInfo[] => {
  return loadAddon()?.listJoysticks() ?? [];
};

/** The gamecontrollerdb mapping line SDL already has for `guid`, or null when unavailable or unmapped. */
const mappingForGuid = (guid: string): string | null => {
  return loadAddon()?.mappingForGuid(guid) ?? null;
};

export {
  addMapping,
  addMappingsFromFile,
  enumerateHid,
  isAvailable,
  listJoysticks,
  mappingForGuid,
  releaseGamepads,
  rescan,
  restoreGamepads,
  rumble,
  SDL_AXIS_NAMES,
  SDL_BUTTON_NAMES,
  start,
  startJoystickCapture,
  startRawCapture,
  stop,
  stopJoystickCapture,
  stopRawCapture,
  version
};
export type { HidDeviceInfo, JoystickInfo, RawCaptureResult, Sdl3Event, Sdl3EventCallback, Sdl3Input };
