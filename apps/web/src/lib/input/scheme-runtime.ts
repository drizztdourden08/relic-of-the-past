/* @layer renderer-lib @kind logic */
/**
 * Everything the per-frame router needs to know about the ACTIVE control scheme, in one
 * mutable object.
 *
 * The scheme, the resolved bindings and the per-save assignments come from three different
 * places and change at three different times (the profile, the settings, and the pause
 * menu), but `pollFrame` runs sixty times a second and must not go asking any of them. So
 * they are pushed here as they change and read from here as one object.
 *
 * `menuSink` is the routing switch. While it is open the enhanced pause menu owns the
 * player's input outright and the core is fed nothing derived from it; the sink receives
 * rising-edge events instead. The store that owns the menu opens and closes it.
 */
import { resolveAxisPressThreshold, STICK_DIRECTION_PRESS_THRESHOLD } from './axis-press-threshold';
import { resolveCoreBindings, resolveModernBindings } from './resolve-bindings';
import { emptyFunctionMask } from '@shared/input/scheme';
import { SDL_AXIS } from '@shared/input/sdl-buttons';
import type { AllowedDevices } from './profile-devices';
import type { ControlSchemeId, FunctionMask, GamepadSample, InputSample } from '@shared/input/scheme';
import type { PauseEvent } from '@shared/game/logic/pause';
import type { DeviceEntry } from '@shared/ipc';
import type { CoreBindings, InputProfile, ModernBindings, ModernScheme } from '@shared/types/controls';

/** Where the pause menu's events go while it owns the input. */
interface MenuSink {
  open: boolean;
  push: (events: PauseEvent[]) => void;
}

interface SchemeRuntime {
  scheme: ControlSchemeId;
  /** Resolved modern bindings for the active profile, or null when there are none. */
  bindings: ModernBindings | null;
  /**
   * The profile's ten core verbs, resolved under EITHER scheme. The four menu verbs live here,
   * so this, not `bindings`, is what makes the pause menu answerable to a classic profile and
   * to a modern one whose pad has gone missing.
   */
  core: CoreBindings | null;
  assignments: ModernScheme;
  /** Classic-only option, carried so the remap selector can be called uniformly. */
  mapOnSelect: boolean;
  menuSink: MenuSink;
  /** Last frame's function read, used as the edge source for `menuEdges`. */
  prev: FunctionMask;
  /**
   * `prev` describes a frame read through a lens that no longer applies (a handover to or
   * from the menu, or a rebuild of the bindings themselves), so it must be re-seeded from a
   * live read before any edge is taken against it. See `edgeBaseline`.
   */
  reseedPrev: boolean;
}

const NO_KEYS: ReadonlySet<string> = new Set<string>();

const schemeRuntime: SchemeRuntime = {
  scheme: 'classic',
  bindings: null,
  core: null,
  assignments: { assignments: {} },
  mapOnSelect: false,
  menuSink: { open: false, push: () => { /* nothing listening yet */ } },
  prev: emptyFunctionMask(),
  reseedPrev: false,
};

/**
 * The edge baseline for THIS frame's read.
 *
 * Normally the previous frame's read. On the first menu frame after a handover it is the
 * CURRENT read instead, so a function that was already down stays down across the boundary
 * and produces no edge.
 *
 * Seeding, not clearing, is the whole point. An empty baseline does the exact opposite of
 * what a handover needs: the button the player is still holding rises out of nothing and
 * reads as a fresh press, so the press that opened the menu immediately asks to close it
 * again one to two frames in, while the core is still scrolling the menu down. Clearing
 * here is what made a normal-length press on the pause button a soft lock.
 */
const edgeBaseline = (pressed: FunctionMask): FunctionMask => {
  if (!schemeRuntime.reseedPrev) return schemeRuntime.prev;
  schemeRuntime.reseedPrev = false;
  return pressed;
};

/**
 * Mark `prev` unusable as an edge source. The next live read replaces it; nothing is
 * cleared, because a cleared mask is not "no information", it is the false claim that
 * everything was up.
 */
const reseedEdges = (): void => { schemeRuntime.reseedPrev = true; };

/** Notified whenever the resolved bindings are rebuilt. See `onSchemeBindings`. */
type SchemeBindingsListener = (bindings: ModernBindings | null) => void;

const bindingsListeners = new Set<SchemeBindingsListener>();

/**
 * Watch the resolved bindings.
 *
 * The per-frame router reads `schemeRuntime.bindings` directly, but the renderer needs the
 * same object to draw the button cluster, and it must be the RESOLVED one. A profile that
 * has never been through the controls screen carries no `modern` block at all, so reading
 * the profile instead would leave the cluster empty for exactly the players who never
 * customised anything. One resolution, one broadcast, two readers.
 *
 * The listener fires immediately with the current value: the input engine resolves bindings
 * at boot, before the modules that care about them are necessarily loaded, so a
 * subscribe-and-wait would silently miss the only push of the session.
 */
const onSchemeBindings = (listener: SchemeBindingsListener): (() => void) => {
  bindingsListeners.add(listener);
  listener(schemeRuntime.bindings);
  return () => { bindingsListeners.delete(listener); };
};

/**
 * Do two resolutions describe the same thing?
 *
 * A derived resolution builds a fresh object every time, and the device snapshot is re-taken
 * on a timer, so identity alone would call every rebuild a change, resetting the edge source
 * under a held button and re-rendering the cluster once a second for a device list that never
 * moved. The shape is small, flat and plain-data, so a serialized compare is both correct and
 * cheap at this rate.
 */
const sameResolution = (a: unknown, b: unknown): boolean =>
  a === b || (a != null && b != null && JSON.stringify(a) === JSON.stringify(b));

/**
 * Re-resolve both lenses after a profile change or a device coming and going.
 *
 * The core lens is rebuilt on every call and compared on its own: it can move while the modern
 * lens does not (a classic profile rebinding a menu verb never has a modern lens at all), and
 * an early return on the modern compare alone would leave the menu reading last profile's keys.
 */
const rebuildSchemeBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): void => {
  const nextCore = resolveCoreBindings(profile, devices);
  const coreMoved = !sameResolution(schemeRuntime.core, nextCore);
  if (coreMoved) schemeRuntime.core = nextCore;
  const next = resolveModernBindings(profile, devices);
  if (sameResolution(schemeRuntime.bindings, next)) {
    if (coreMoved) reseedEdges();
    return;
  }
  schemeRuntime.bindings = next;
  reseedEdges();
  for (const listener of bindingsListeners) {
    try { listener(next); } catch (e: unknown) { console.error('[controls] bindings listener failed', e); }
  }
};

/** Settings → runtime. Both fields move together whenever the profile's settings are pushed. */
const setControlScheme = (scheme: ControlSchemeId, mapOnSelect: boolean): void => {
  if (schemeRuntime.scheme !== scheme) reseedEdges();
  schemeRuntime.scheme = scheme;
  schemeRuntime.mapOnSelect = mapOnSelect;
};

/**
 * Partial pushes of the pair above. The scheme and the classic map/select option are stored
 * together because the remap selector is called with both, but the settings that change them
 * arrive one at a time. So each of these carries the other field through untouched.
 */
const setSchemeId = (scheme: ControlSchemeId): void => {
  setControlScheme(scheme, schemeRuntime.mapOnSelect);
};

/** Classic-only: the map opens on Select instead of on X. */
const setMapOnSelect = (mapOnSelect: boolean): void => {
  setControlScheme(schemeRuntime.scheme, mapOnSelect);
};

const setSchemeAssignments = (assignments: ModernScheme): void => {
  schemeRuntime.assignments = assignments;
};

/**
 * Open or close the menu's claim on the input. The edge source is re-seeded on both
 * transitions from the next live read, never from an empty mask, so a button still held
 * from the frame the menu opened reads as held on either side of the boundary instead of
 * as a fresh press. Both directions matter: the same manufactured edge that closed a
 * just-opened menu would, on the way out, hand the game a phantom press of whatever the
 * player was holding when they left the menu.
 */
const setMenuSinkOpen = (open: boolean): void => {
  if (schemeRuntime.menuSink.open === open) return;
  schemeRuntime.menuSink.open = open;
  reseedEdges();
};

const setMenuSinkPush = (push: (events: PauseEvent[]) => void): void => {
  schemeRuntime.menuSink.push = push;
};

/**
 * One frame of raw machine state, in the shape the scheme layer reads. Only the devices the
 * active profile allows are included, matching the classic path's gate exactly; the trigger
 * threshold is the one the first allowed pad resolves to, since a mixed-pad session shares
 * one reading here.
 */
const buildInputSample = (
  keys: ReadonlySet<string>,
  hidStates: Map<string, { buttons: boolean[]; axes: number[] }>,
  allowed: AllowedDevices,
): InputSample => {
  const pads: GamepadSample[] = [];
  let triggerThreshold: number | undefined;
  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    pads.push(state);
    if (triggerThreshold === undefined) triggerThreshold = resolveAxisPressThreshold(SDL_AXIS.LEFT_TRIGGER, deviceKey);
  }
  return {
    keys: allowed.keyboard ? keys : NO_KEYS,
    pads,
    axisThreshold: STICK_DIRECTION_PRESS_THRESHOLD,
    triggerThreshold,
  };
};

export {
  buildInputSample, edgeBaseline, onSchemeBindings, rebuildSchemeBindings, reseedEdges,
  resolveModernBindings, schemeRuntime, setControlScheme, setMapOnSelect, setMenuSinkOpen,
  setMenuSinkPush, setSchemeAssignments, setSchemeId,
};
export type { MenuSink, SchemeBindingsListener, SchemeRuntime };
