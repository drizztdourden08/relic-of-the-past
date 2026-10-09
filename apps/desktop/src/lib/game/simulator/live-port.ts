/* @layer bridge-wasm @kind logic */
import type { SimulatorPort, RoomSectionSplit } from '@shared/game/simulation';
import type { ItemId } from '@rotp/game-data';
import { captureStateBuffer, loadStateFromBuffer, reassertFeatureFlags, deliveryQueue, setSimulatorSupport } from '../';
import { setAutoSkipDialogOverride, setDeveloperToolsOverride } from '@rotp/game-core';
import { onItemReceived } from '../tracker';
import { observe } from './observe';
import { getScreenGrids } from '../flood';
import { getRoomChests, getRoomSprites, getOverworldSprites, getRoomDoors } from './interactables';
import { wasmGetRoomTagsFor, wasmGetSpriteCombat, wasmGetCombatTables, wasmGetRoomLayoutInfo, roomSectionSplitFrom } from '../';
import { trigger } from './trigger';

const setAutoSkipDialog = (on: boolean | null): void => {
  setAutoSkipDialogOverride(on);
  reassertFeatureFlags();
};

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

const subscribeItem = (cb: (itemId: ItemId) => void): (() => void) =>
  onItemReceived((itemId) => cb(itemId));

const getRoomSectionSplit = (): RoomSectionSplit => roomSectionSplitFrom(wasmGetRoomLayoutInfo());

const createLiveGamePort = (): SimulatorPort => {
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
    getRoomSectionSplit,
    trigger,
    setAutoSkipDialog,
    setDeveloperTools,
    setSimulatorSupport,
    snapshotState,
    restoreState,
    onItemReceived: subscribeItem,
  };
};

export { createLiveGamePort };
