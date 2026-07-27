/* @layer bridge-wasm @kind logic */
/**
 * LiveGamePort — the SimulatorPort adapter that drives the real game through the
 * wasm bridge + delivery queue. The pure engine only ever speaks to this seam.
 *
 * Runner contract: the engine's verifying phase diffs the flag snapshot AFTER a
 * trigger, so the runner must `await port.trigger(action)` and then allow ~2
 * frames to elapse before stepping the engine with a fresh `observe()`, passing
 * the id from the last `onItemReceived` callback as `obs.itemReceived`. Awaiting
 * trigger() alone only guarantees the delivery executed (flag set + item
 * granted); the extra frames let item-receipt and auto-skip-dialog settle.
 */
import type { SimulatorPort } from '@shared/game/simulation';
import { captureStateBuffer, loadStateFromBuffer, reassertFeatureFlags, deliveryQueue } from '../';
import { setAutoSkipDialogOverride, setDeveloperToolsOverride } from '../live-settings-flags';
import { onItemReceived } from '../tracker';
import { observe } from './observe';
import { getScreenGrids } from '../flood';
import { getRoomChests, getRoomSprites, getOverworldSprites, getRoomDoors } from './interactables';
import { wasmGetRoomTagsFor, wasmGetSpriteCombat, wasmGetCombatTables } from '../';
import { trigger } from './trigger';

/** Force the features0 auto-skip-dialog bit (or defer to the user's setting with null) and push it to the core immediately. */
const setAutoSkipDialog = (on: boolean | null): void => {
  setAutoSkipDialogOverride(on);
  reassertFeatureFlags();
};

/** Force the features0 developer-tools bit (or defer to the user's setting with null) and push it to the core immediately. */
const setDeveloperTools = (on: boolean | null): void => {
  setDeveloperToolsOverride(on);
  reassertFeatureFlags();
};

const snapshotState = (): Promise<ArrayBuffer> => {
  const buf = captureStateBuffer();
  return buf ? Promise.resolve(buf) : Promise.reject(new Error('snapshotState: capture failed'));
};

const restoreState = (buf: ArrayBuffer): Promise<void> => {
  loadStateFromBuffer(buf);
  return Promise.resolve();
};

const subscribeItem = (cb: (itemId: number) => void): (() => void) =>
  onItemReceived((_name, itemId) => cb(itemId));

const createLiveGamePort = (): SimulatorPort => {
  // The delivery queue drains on its own rAF loop; ensure it is running so
  // trigger() completions fire even if the game was started without it.
  deliveryQueue.startProcessing();
  return {
    observe,
    getScreenGrids,
    getRoomChests,
    getRoomSprites,
    getOverworldSprites,
    getRoomDoors,
    getRoomTags: wasmGetRoomTagsFor,
    getSpriteCombat: wasmGetSpriteCombat,
    getCombatTables: wasmGetCombatTables,
    trigger,
    setAutoSkipDialog,
    setDeveloperTools,
    snapshotState,
    restoreState,
    onItemReceived: subscribeItem,
  };
};

export { createLiveGamePort };
