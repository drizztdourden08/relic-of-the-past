/* @layer shared-game @kind types */
/**
 * SimulatorPort — the single seam between the pure engine and the outside
 * world. `LiveGamePort` drives the real game via the wasm bridge; a future
 * `DataWorldPort` replays the recorded dataset offline. The engine only ever
 * speaks to this interface.
 */
import type { ItemId } from '../data';
import type {
  SimObservation,
  SimLocation,
  ScreenGridBundle,
  SimChest,
  SimSprite,
  SimDoor,
  TriggerAction,
  SpriteCombatInfo,
  CombatTables,
  RoomSectionSplit,
} from './types';

interface SimulatorPort {
  observe: () => SimObservation;
  getScreenGrids: (loc: SimLocation) => ScreenGridBundle;
  getRoomChests: (roomId: number) => SimChest[];
  getRoomSprites: (roomId: number) => SimSprite[];
  getOverworldSprites: (screenIndex: number) => SimSprite[];
  getRoomDoors: (roomId: number) => SimDoor[];
  /** Room-header TAG bytes — scripted effects (kill-to-open-door family etc.). */
  getRoomTags: (roomId: number) => [number, number];
  /** Resolved combat row for one sprite type; null off the developer-tools gate or out of range. */
  getSpriteCombat: (spriteType: number) => SpriteCombatInfo | null;
  /** Shared ancilla/projectile combat tables; null when the developer-tools gate is off. */
  getCombatTables: () => CombatTables | null;
  /** Scroll-section split of the currently loaded indoor room (all-false outdoors
   *  or when no room is loaded). */
  getRoomSectionSplit: () => RoomSectionSplit;
  trigger: (action: TriggerAction) => Promise<void>;
  /** features0 auto-skip-dialog bit: true/false force it; null defers to the user's setting. */
  setAutoSkipDialog: (on: boolean | null) => void;
  /** features0 developer-tools bit: true/false force it; null defers to the user's setting. */
  setDeveloperTools: (on: boolean | null) => void;
  /** Memento: snapshot pre-run state so it can be restored afterwards. */
  snapshotState: () => Promise<ArrayBuffer>;
  restoreState: (buf: ArrayBuffer) => Promise<void>;
  /** The item that was granted, by dataset id. The tracker resolves the native
   *  receive index to a record already, so nothing downstream re-derives it. */
  onItemReceived: (cb: (itemId: ItemId) => void) => () => void;
}

export type { SimulatorPort, SimLocation, ScreenGridBundle };
