/* @layer electron-main @kind logic */
/**
 * Loader and typed wrapper for the SDL3 gamepad Node-API addon.
 *
 * Runtime require on first use, so a missing or unbuilt addon degrades to "this
 * transport is unavailable" (callers fall back to HID) instead of taking the app
 * down at startup. Pure transport: no button/axis interpretation happens here.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { HidDeviceInfo, JoystickInfo, RawCaptureResult, Sdl3Event, Sdl3EventCallback, Sdl3Input } from './sdl3.type';
import { SDL_AXIS_NAMES, SDL_BUTTON_NAMES } from './sdl3.type';

let addon: Sdl3Input | null = null;
let attempted = false;

/** electron-vite bundles main to `dist/electron/`, two levels below the repo
 * root, so `__dirname` never holds a `prebuilds/` of its own. */
const SOURCE_TREE_RELATIVE = 'apps/desktop/electron/input/native/sdl3/prebuilds';

/** Candidate addon paths in priority order: packaged resources, source-tree
 * prebuilt (bundled main, then a cwd fallback), then a local dev build. */
const addonCandidates = (): string[] => {
  const platformArch = `${process.platform}-${process.arch}`;
  return [
    // Shipped as extraResources (never asar-packed), see
    // scripts/build/electron-builder.config.js. resourcesPath is only set once packaged.
    ...(process.resourcesPath ? [join(process.resourcesPath, 'sdl3', platformArch, 'sdl3_input.node')] : []),
    // Bundled main process: resolve back to the addon's home in the source tree.
    join(__dirname, '..', '..', SOURCE_TREE_RELATIVE, platformArch, 'sdl3_input.node'),
    // electron-vite dev runs with cwd at the repo root; fallback if __dirname moves.
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
 * Every HID gamepad-like device the OS reports, whether or not SDL could claim
 * it, so "held by another application" is tellable apart from "not plugged in".
 * Empty when unavailable.
 */
const enumerateHid = (): HidDeviceInfo[] => {
  return loadAddon()?.enumerateHid() ?? [];
};

/**
 * Tear the gamepad subsystem down and back up so SDL re-probes devices it cached
 * as unavailable at startup. Fire-and-forget: watch for `removed`/`added` events
 * on the `start()` callback. No-op when unavailable.
 */
const rescan = (): void => {
  loadAddon()?.rescan();
};

/**
 * Closes every open gamepad+joystick and quits the gamepad subsystem so a raw HID
 * open on the same device can succeed. The SDL thread and SDL_hid_* stay alive.
 * Fire-and-forget: watch for `removed` events and `gamepad-hold` with `held: true`.
 * False when unavailable.
 */
const releaseGamepads = (): boolean => {
  return loadAddon()?.releaseGamepads() ?? false;
};

/**
 * Restores the gamepad subsystem, replaying every mapping this addon has added.
 * Works without a prior `releaseGamepads`. SDL re-synthesizes `added` events and
 * a `gamepad-hold` with `held: false` follows. False when unavailable.
 */
const restoreGamepads = (): boolean => {
  return loadAddon()?.restoreGamepads() ?? false;
};

/** The linked SDL3 version string, or null when unavailable. */
const version = (): string | null => {
  return loadAddon()?.version() ?? null;
};

/**
 * Open a diagnostic raw HID capture on `vendorId`/`productId`. One capture at a
 * time: a second call closes the first. Bytes arrive as `raw` events on the
 * `start()` callback. `reason: 'unavailable-exclusive'` for a controller SDL
 * already holds through libusb is the case this exists to explain, not a failure.
 * Generic error result when unavailable.
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
 * Start a joystick-level capture on `joystickId`: the raw button/axis/hat indices
 * a gamecontrollerdb mapping line is written in. Samples arrive as `joystick`
 * events on the `start()` callback, only when something changes. False when unavailable.
 */
const startJoystickCapture = (joystickId: number): boolean => {
  return loadAddon()?.startJoystickCapture(joystickId) ?? false;
};

/** Stop the joystick-level capture, if any. No-op when unavailable. */
const stopJoystickCapture = (): void => {
  loadAddon()?.stopJoystickCapture();
};

/**
 * Every joystick SDL has open, gamepad-mapped or not. This is how an unmapped
 * controller becomes visible at all. Empty when unavailable.
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
