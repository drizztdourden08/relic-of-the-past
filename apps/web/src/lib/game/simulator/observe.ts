/* @layer bridge-wasm @kind logic */
/**
 * Builds a SimObservation from live game state. The real location comes from the
 * game UI-state buffer; the virtual location is that same spot expressed as a
 * known screen id (via screen detection) plus the player's pixel→tile conversion.
 * Inventory is the tracker's Set; flags are independent SRAM copies for diffing.
 */
import type { SimObservation, VirtualPlayer, FlagSnapshot, SimLocation, SimulatorPort } from '@shared/game/simulation';
import type { EngineState } from '@shared/game/simulation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { SCREEN_BY_ID } from '@shared/game/data/screens';
import { detectScreenExits } from './screen-exits';
import { locationForScreen } from './screen-location';
import { interiorScreenId } from './screen-resolve';
import type { GridPos } from '@shared/game/navigation';
import type { DetectedScreen } from './screen-exits';
import { emptySnapshot, buildPresenceState, emptyPresenceState } from '@shared/game/simulation';
import type { MapState } from '@shared/game/types';
import type { VariantGameState } from '@shared/game/data/screens';
import { resolveCurrentScreen } from '@shared/game/data/screens';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';
import { wasmGetProgressIndicator, wasmReadFlagSnapshot } from '../';
import { getCompletedChecks, getCurrentInventory, pollInventoryState } from '../tracker';
import { screenOriginFor } from '../flood';
import { readMapState } from './read-game-state';

const IDLE_VIRTUAL: VirtualPlayer = { screenId: 'unknown', tile: { row: 0, col: 0 } };

const tileOf = (map: MapState): GridPos => {
  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors: map.isIndoors, linkX: map.linkX, linkY: map.linkY, screenIndex: map.overworldScreenIndex,
  });
  return linkStartTile({ linkX: map.linkX, linkY: map.linkY, screenWorldX, screenWorldY });
};

const virtualFrom = (map: MapState): VirtualPlayer => {
  // The traversal key is the GAME's own number — room index indoors, overworld
  // screen index outdoors. Screen DETECTION (which dataset entry this is) used to
  // seed it, which meant a colliding room index put the virtual player in the
  // wrong place before the first hop. Identity no longer depends on the dataset.
  // Region-qualified indoors, so the live position keys the same node the exit
  // that led here named — see interiorScreenId.
  const screenId = map.isIndoors
    ? interiorScreenId(map.roomIndex, tileOf(map))
    : `ow:${map.overworldScreenIndex}`;

  return { screenId, tile: tileOf(map) };
};

const readFlags = (): FlagSnapshot => wasmReadFlagSnapshot() ?? emptySnapshot();

const observe = (): SimObservation => {
  // Refresh the tracker's inventory/completed-check sets from WRAM so the
  // observation reflects the latest state (notably right after a delivered item).
  // Non-forced: it re-reads every call but only logs/notifies on an actual change.
  pollInventoryState();
  const map = readMapState();
  if (!map) {
    return {
      virtual: IDLE_VIRTUAL,
      realLocation: { isIndoors: false, roomId: 0, owScreenIndex: 0 },
      inventory: new Set(),
      flags: emptySnapshot(),
      presenceState: emptyPresenceState(),
    };
  }
  const inventory = new Set(getCurrentInventory());
  const flags = readFlags();
  return {
    virtual: virtualFrom(map),
    realLocation: { isIndoors: map.isIndoors, roomId: map.roomIndex, owScreenIndex: map.overworldScreenIndex },
    inventory,
    flags,
    // NPC-presence snapshot: progress bytes + follower live in the 16-byte
    // progress buffer, the SRAM copies come from the same flag snapshot.
    presenceState: buildPresenceState({
      progress: flags.progress,
      owEventInfo: flags.owEventInfo,
      roomState: flags.dungInfo,
      inventory,
    }),
  };
};

export { observe };

// ─── Shared runner-loop pieces ───────────────────────────────────────────────
// The widget runner and the headless `--sim-run` driver both step the engine, and
// both needed the same four things around it. They each had their own verbatim
// copy (including the cache key), so a fix to one silently missed the other.

const TILE_REQS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot'];

/** Detect results cached per screen + epoch + entry region. */
type DetectCache = Map<string, DetectedScreen | null>;

/** Flood inventory from the engine's reach tokens (always includes bare-hands lift). */
const floodItems = (state: EngineState): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const t of state.reachTokens) if (TILE_REQS.includes(t)) items.add(t as TileReq);
  return [...items];
};

/**
 * Detect (flood + exits) the virtual player's current screen, cached per epoch.
 * Keyed by entry REGION (quantized tile) too — a room re-entered through a
 * different door floods a different region and needs its own detection.
 */
const detectFor = (state: EngineState, cache: DetectCache): DetectedScreen | null => {
  const t = state.virtual.tile;
  const key = `${state.virtual.screenId}#${state.epoch}#${t.row >> 4},${t.col >> 4}`;
  if (!cache.has(key)) {
    cache.set(key, detectScreenExits(state.virtual.screenId, { entryTile: state.virtual.tile, items: floodItems(state) }));
  }
  return cache.get(key) ?? null;
};

/** Pull grids + room interactables + detected exits for the current screen. */
const buildObservation = (port: SimulatorPort, state: EngineState, cache: DetectCache, itemReceived?: number): SimObservation => {
  const base = port.observe();
  const loc = locationForScreen(state.virtual.screenId);
  if (!loc) return { ...base, itemReceived };
  // The room queries decode dungeon-indexed room tables; outdoor screens read the
  // overworld sprite table instead. Overworld chests and doors don't exist as
  // interactables (standing items and secrets come later), so only sprites are supplied.
  const interactables = loc.isIndoors
    ? {
        chests: port.getRoomChests(loc.roomId),
        sprites: port.getRoomSprites(loc.roomId),
        doors: port.getRoomDoors(loc.roomId),
        tags: port.getRoomTags(loc.roomId),
      }
    : { chests: [], sprites: port.getOverworldSprites(loc.owScreenIndex), doors: [] };
  const detected = detectFor(state, cache);
  return {
    ...base,
    grids: port.getScreenGrids(loc),
    interactables,
    itemReceived,
    exits: detected?.exits,
    reached: detected?.reached,
  };
};

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** Two frames so a triggered delivery has landed before the next observation. */
const waitAfterTrigger = async (): Promise<void> => { await nextFrame(); await nextFrame(); };

export { buildObservation, detectFor, floodItems, locationForScreen, nextFrame, waitAfterTrigger };
export type { DetectCache };
