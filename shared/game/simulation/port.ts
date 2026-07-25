/* @layer shared-game @kind types */
/**
 * SimulatorPort — the single seam between the pure engine and the outside
 * world. `LiveGamePort` drives the real game via the wasm bridge; a future
 * `DataWorldPort` replays the recorded dataset offline. The engine only ever
 * speaks to this interface.
 */
import type {
  SimObservation,
  SimLocation,
  ScreenGridBundle,
  SimChest,
  SimSprite,
  SimDoor,
  TriggerAction,
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
  trigger: (action: TriggerAction) => Promise<void>;
  /** features0 auto-skip-dialog bit: true/false force it; null defers to the user's setting. */
  setAutoSkipDialog: (on: boolean | null) => void;
  /** Memento: snapshot pre-run state so it can be restored afterwards. */
  snapshotState: () => Promise<ArrayBuffer>;
  restoreState: (buf: ArrayBuffer) => Promise<void>;
  onItemReceived: (cb: (itemId: number) => void) => () => void;
}

export type { SimulatorPort, SimLocation, ScreenGridBundle };
