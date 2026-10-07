/* @layer renderer-lib @kind logic */
/**
 * Where one frame of input GOES. This is the single decision `pollFrame` delegates.
 *
 * The first question is NOT which scheme is active. It is whether the host owns the pause
 * menu right now, because while it does there is no other way out of it: the native Start
 * branch that would close the menu lives inside the function the host's hold returns from,
 * so the only thing that can still close it is a menu verb read here and pushed to the sink.
 * Routing on the scheme first is what made Classic + Enhanced a soft-lock.
 *
 * Three routes, in the order they are chosen:
 *
 *  1. **Menu open, any scheme.** The enhanced pause menu owns the input outright. The frame
 *     is read as functions, turned into rising-edge events and handed to the menu; the core is
 *     fed a zero mask so nothing leaks into gameplay under the held menu. One physical press
 *     produces ONE meaning there: contract §11 shares a button between a menu verb and a
 *     gameplay slot, so the slots parked under a verb the menu consumes are named here and
 *     their slot edges dropped, or changing screen would also assign whatever the cursor is on.
 *  2. **Modern, menu closed.** The frame is remapped to a console mask, and if a pressed
 *     slot holds an item the save ACTUALLY has, the equipped-item register is written FIRST.
 *     Ownership is asked here because this is the layer that holds the live save; the remap is
 *     pure. An assignment for an item this file has never found fires nothing at all.
 *  3. **Classic, menu closed.** The profile's console mappings become a bitmask, which the
 *     classic remap strategy then applies the map/save swap to.
 *
 * That ordering in route 2 is the whole mechanism, not a detail: the mask carries the Y bit
 * for the item, and the core reads the register on the frame Y is pressed. Writing the
 * register after the mask would fire the previous item once on every switch.
 */
import { computeBitmask } from './polling-engine';
import { buildInputSample, edgeBaseline, schemeRuntime } from './scheme-runtime';
import {
  emptyFunctionMask, menuEdges, menuShadowedSlots, readFunctionMask, remapForScheme,
} from '@shared/input/scheme';
import { ownsHudItem } from './item-ownership';
import { setActiveItem } from '../game/host-menu';
import type { SchemeRuntime } from './scheme-runtime';
import type { InputSample } from '@shared/input/scheme';
import type { ModernBindings, ModernSlot, SlotIndex } from '@shared/types/controls';
import type { InputManager } from './input-manager';

/** Nothing down. Shared because the classic strategy ignores it and never mutates it. */
const NO_FUNCTIONS = emptyFunctionMask();
const NO_SLOTS: ModernSlot[] = [];
/** No lens, so nothing can be shadowed, and nothing can be a slot either. */
const NO_SHADOW: ReadonlySet<SlotIndex> = new Set<SlotIndex>();

const classicMask = (m: InputManager): number =>
  computeBitmask(m.keyStates, m.keyboardMap, m.gamepadButtonMap, m.gamepadAxisMap, m.hidStates, m.allowed);

const sampleOf = (m: InputManager): InputSample =>
  buildInputSample(m.allPressedKeys, m.hidStates, m.allowed);

/** Is the modern lens both selected AND resolved? A pad that walked away answers no. */
const modernActive = (runtime: SchemeRuntime): boolean =>
  runtime.scheme === 'modern' && runtime.bindings !== null;

/**
 * What this frame is read against.
 *
 * The modern lens when it is in force, otherwise the profile's core verbs alone,
 * which every profile carries, classic ones included (contract §5). Slots are deliberately
 * empty in the fallback: under classic a "slot" is not a thing the player can fire, so
 * offering the menu slot presses to assign would be inventing a control that does not exist.
 */
const readLens = (runtime: SchemeRuntime): ModernBindings | null => {
  if (modernActive(runtime) && runtime.bindings) return runtime.bindings;
  const core = runtime.core ?? runtime.bindings?.core ?? null;
  return core ? { core, slots: NO_SLOTS } : null;
};

/** Route 1. The menu owns the frame, whatever the scheme says. */
const routeToMenu = (m: InputManager, runtime: SchemeRuntime): void => {
  const lens = readLens(runtime);
  // No lens at all (an unassigned profile) still has to zero the core instead of falling
  // through: the mouse remains the way out, and the player must not be walking underneath it.
  const pressed = lens ? readFunctionMask(sampleOf(m), lens) : NO_FUNCTIONS;
  // Which slots this lens has parked under a verb the menu consumes. Recomputed per menu
  // frame, not cached: it is nine comparisons per slot, it is only asked while the
  // player is standing in a paused menu, and a cache would be one more thing to invalidate
  // on the rebind that changes the answer.
  const shadowed = lens ? menuShadowedSlots(lens) : NO_SHADOW;
  // The baseline is last frame's read, EXCEPT on the frame after a handover, where it is
  // this frame's (see `edgeBaseline`). A button held from the press that opened the menu
  // must not rise again on the far side of the boundary.
  runtime.menuSink.push(menuEdges(pressed, edgeBaseline(pressed), shadowed));
  // Zero instead of silence: the core holds whatever mask it was last handed, so merely
  // not calling would leave the player walking into a wall behind the menu.
  m.setInputFn?.(0);
  runtime.prev = pressed;
};

/** Route 2, modern gameplay. Functions in, console mask plus an equipped item out. */
const routeModern = (m: InputManager, runtime: SchemeRuntime, bindings: NonNullable<SchemeRuntime['bindings']>): void => {
  const pressed = readFunctionMask(sampleOf(m), bindings);
  const { mask, activeItem } = remapForScheme({
    scheme: 'modern',
    classicMask: 0,
    pressed,
    assignments: runtime.assignments,
    mapOnSelect: runtime.mapOnSelect,
    ownsItem: ownsHudItem,
  });
  // 0 means "leave the core's own equipped item alone". It is not an item id, and writing
  // it would park the register on a row nothing maps to. Deduping is the facade's job.
  if (activeItem !== 0) setActiveItem(activeItem);
  m.setInputFn?.(mask);
  runtime.prev = pressed;
};

/**
 * Route 3, classic gameplay. The console mappings already produced the mask, but it still
 * goes through the strategy table instead of straight to the core: `mapOnSelect` is a real
 * setting and the swap that implements it lives there. Sending `computeBitmask` on untouched
 * is what made that checkbox inert.
 */
const routeClassic = (m: InputManager, runtime: SchemeRuntime): void => {
  const { mask } = remapForScheme({
    scheme: 'classic',
    classicMask: classicMask(m),
    pressed: NO_FUNCTIONS,
    assignments: runtime.assignments,
    mapOnSelect: runtime.mapOnSelect,
    ownsItem: ownsHudItem,
  });
  m.setInputFn?.(mask);
};

const routeInputFrame = (m: InputManager): void => {
  const runtime = schemeRuntime;
  if (runtime.menuSink.open) {
    routeToMenu(m, runtime);
    return;
  }
  const bindings = runtime.bindings;
  if (modernActive(runtime) && bindings) routeModern(m, runtime, bindings);
  else routeClassic(m, runtime);
};

export { routeInputFrame };
