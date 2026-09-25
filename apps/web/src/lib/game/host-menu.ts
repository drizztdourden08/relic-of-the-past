/* @layer bridge-wasm @kind logic */
/**
 * The app-facing facade over the six `WasmHost*` exports for the host-owned pause menu.
 *
 * Two pieces of state live here and nowhere else:
 *
 *  - **The takeover is WANTED state, not a command.** Exactly like `WasmSetHudHidden`, the
 *    request outlives the core: a fresh boot starts with it clear, and a save-state load can
 *    run the C teardown and drop it. So the request is remembered and re-asserted on the
 *    frame the module starts running, and whenever the core is seen to have let go.
 *  - **The wanted equipped item.** The core has one register and the native menu's own init
 *    walks the 21-entry grid before the host's hold matters, which replaces any id that grid
 *    has no row for (a bottle, or the digging tool). Byte 130 of the state buffer is the
 *    register read back, so `reconcileHostMenu` can see that happen and write it again.
 *
 * Deduping the item write here instead of at the call site is deliberate: `pollFrame` calls
 * this every frame an item slot is down, and the re-assert paths must be able to bypass the
 * dedupe. One owner, two doors.
 */
import type { HostMenuState } from '@shared/game/types';
import type { GearLadderKind } from '@shared/game/logic/pause';
import type { GameState } from './types';
import {
  wasmHostMenuClose, wasmHostMenuSaveAndQuit, wasmHostMenuSetTakeover,
  wasmHostSetActiveItem, wasmHostSetGear,
} from './bridge/host-menu';
import { getProfileId, subscribeGameState } from './wasm-bridge';

/** `kind` argument of WasmHostSetGear, in the order host_menu_gear.c reads it. */
const GEAR_KIND_ARG: Record<GearLadderKind, number> = { sword: 0, shield: 1, mail: 2, bow: 3 };

const FIRST_HUD_ITEM = 1;
const LAST_HUD_ITEM = 24;

let wantedTakeover = false;
let wantedItem = 0;
let lastHolding = false;
let seenProfileId: string | null = null;

const pushItem = (hudItem: number): void => {
  if (hudItem !== 0) wasmHostSetActiveItem(hudItem);
};

/** Push the standing request as it is, dedupe or not. Used for boot and post-load repair. */
const reassertHostMenu = (): void => {
  wasmHostMenuSetTakeover(wantedTakeover);
  if (wantedTakeover) pushItem(wantedItem);
};

/**
 * Arm or disarm the takeover. On whenever the host owns the pause menu. The Enhanced HUD
 * style and the modern control scheme (which implies it) both do. Never a raw user toggle.
 */
const setTakeover = (on: boolean): void => {
  wantedTakeover = on;
  wasmHostMenuSetTakeover(on);
  if (on) pushItem(wantedItem);
};

/** Write the equipped-item register. New-style ids only; 0 means "leave the core's alone". */
const setActiveItem = (hudItem: number): void => {
  if (!Number.isInteger(hudItem) || hudItem < FIRST_HUD_ITEM || hudItem > LAST_HUD_ITEM) return;
  if (hudItem === wantedItem) return;
  wantedItem = hudItem;
  wasmHostSetActiveItem(hudItem);
};

/** Write the wanted item again after the native menu moved it, bypassing the dedupe. */
const reassertActiveItem = (): void => pushItem(wantedItem);

/**
 * Re-arm after the core read a save back into WRAM, by a save-state load or the player picking an
 * in-game save FILE.
 *
 * The takeover itself usually survives both, so `reconcileHostMenu` sees no drop and does nothing.
 * What does not survive is the side effect of arming it: `WasmHostMenuSetTakeover` zeroes
 * hud_cur_item_x/l/r (HostMenu_DropSecondaryItems), and a save written under the abandoned lane
 * design carries those bytes back. `DidPressButtonForMap` reads hud_cur_item_x with no feature gate
 * of its own and moves the map to Select the moment it is non-zero, while the modern scheme is
 * still sending X. So the map button goes quiet until this runs.
 *
 * Re-sending the standing request is the whole fix: the C side re-clears the registers on every
 * arming call, so nothing new is exported and nothing is rebuilt. `lastHolding` is dropped with it
 * because the WRAM that mirror described has just been replaced.
 */
const reassertAfterSaveLoad = (): void => {
  lastHolding = false;
  if (!wantedTakeover) return;
  reassertHostMenu();
};

/**
 * What the host last asked the register to hold, or 0 if it never has. The pause menu reads
 * this, not byte 130, when deciding which cell to open on: on the frame the menu
 * appears, byte 130 may still be showing the value the native init just replaced.
 */
const wantedActiveItem = (): number => wantedItem;

/**
 * Per-frame repair from the state buffer. Two drifts are worth chasing and no others:
 * the core letting go of a takeover we still want (a save-state load runs the teardown),
 * and the register holding something other than what we last wrote while the takeover is
 * in force. Anything else is the game's own business.
 */
const reconcileHostMenu = (live: HostMenuState): void => {
  const dropped = lastHolding && !live.holding;
  lastHolding = live.holding;
  if (wantedTakeover && dropped) {
    reassertHostMenu();
    return;
  }
  if (wantedTakeover && live.holding && wantedItem !== 0 && live.activeItem !== wantedItem) {
    wasmHostSetActiveItem(wantedItem);
  }
};

const closeHostMenu = (): void => wasmHostMenuClose();
const saveAndQuitHostMenu = (): void => wasmHostMenuSaveAndQuit();
/**
 * Write one ladder. `tier` is the ladder's own rung. That is a gear tier for the first three,
 * and the arrow TYPE (0 plain, 1 silver) for the fourth. Nothing here computes the
 * launcher register: the C side reads its live value and puts the ammunition half back,
 * which is the only place that half can be read without a race against the frame.
 */
const setGear = (kind: GearLadderKind, tier: number): void =>
  wasmHostSetGear(GEAR_KIND_ARG[kind], tier);

/** A fresh core owns nothing; drop the mirror so it cannot go stale across a profile swap.
 *  Module-private: the boot subscription below is the only thing that can know a swap
 *  happened, so exposing this would only offer callers a way to desync the mirror. */
const resetHostMenu = (): void => {
  wantedTakeover = false;
  wantedItem = 0;
  lastHolding = false;
};

// Two jobs, both on the frame the module starts running.
//
// A takeover armed from settings before the module existed is swallowed by the bridge's
// running-guard, exactly as an armed host gate once was (see bridge/host-gates.ts
// `reassertHostGates`), so the arming has to be replayed here.
//
// And a boot under a DIFFERENT profile is a different core, different settings and a
// different save, so the mirror from the profile that just went away is dropped first.
// Otherwise the re-assert below would push the previous profile's equipped item into a
// core that never agreed to it. `lifecycle` sets the profile id before the status, so
// the id read here is already the new one. Nothing re-arms by hand: the settings pull in
// `control-scheme-store.refreshControlSettings` runs off the UI store and calls
// `setTakeover` again with the new profile's own answer.
const onGameState = (state: GameState): void => {
  if (state.status !== 'running') { lastHolding = false; return; }
  const profileId = getProfileId();
  const swapped = seenProfileId !== null && profileId !== seenProfileId;
  seenProfileId = profileId;
  if (swapped) { resetHostMenu(); return; }
  if (wantedTakeover) reassertHostMenu();
};

let subscribed = false;

/**
 * Install the boot subscription above. Called from `lifecycle.startGame`, the same way
 * `initGearOwnership` is, and deliberately NOT run on import: a module that registers a global
 * subscription merely because something imported it runs its body at whatever point the bundler
 * happens to evaluate it. Through the `wasm-bridge` re-export cycle, that was before
 * `subscribeGameState` itself existed ("Cannot access 'subscribeGameState' before initialization",
 * bundled builds only; native ESM in dev ordered the cycle the other way and hid it).
 *
 * Re-entrant, and installed for the life of the renderer once it is: `subscribeGameState` replays
 * the current state a microtask later, so calling this after the status is already 'running' still
 * sees that boot, and the same listener then covers every later boot and teardown.
 */
const initHostMenu = (): void => {
  if (subscribed) return;
  subscribed = true;
  subscribeGameState(onGameState);
};

export {
  closeHostMenu, initHostMenu, reassertActiveItem, reassertAfterSaveLoad, reassertHostMenu,
  reconcileHostMenu, saveAndQuitHostMenu, setActiveItem, setGear, setTakeover, wantedActiveItem,
};
