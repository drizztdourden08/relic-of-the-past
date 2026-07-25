/* @layer renderer-widgets @kind logic */
/**
 * Side helpers for the simulator runner: assembling a full SimObservation for
 * the virtual Link's current screen (including the game-driven exits detected by
 * flooding it), fanning events out to the store / log-bus / JSONL sink, the
 * per-screen FLOOD + Sequence log events, and the inter-step frame wait.
 */
import type { SimulatorPort, SimObservation, SimEvent, DetectedCheck, RecorderState } from '@shared/game/simulation';
import type { EngineState } from '@shared/game/simulation';
import { recordCheck, screenLabel } from '@shared/game/simulation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { log } from '@app/lib/log-bus';
import { detectScreenExits } from '@app/lib/game/simulator';
import type { DetectedScreen } from '@app/lib/game/simulator';
import { wasmGetProgressIndicator } from '@app/lib/game';
import { locationForScreen } from './sim-location';

interface SimLogSink {
  write: (event: SimEvent) => void;
}

/** One detect per screen+epoch — the flood result feeds BOTH the log and traversal. */
type DetectCache = Map<string, DetectedScreen | null>;

const TILE_REQS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot'];

/** Flood inventory from the engine's reach tokens (always includes bare-hands lift). */
const floodItems = (state: EngineState): TileReq[] => {
  const items = new Set<TileReq>(['lift.1']);
  for (const t of state.reachTokens) if (TILE_REQS.includes(t)) items.add(t as TileReq);
  return [...items];
};

/** Detect (flood + exits) the virtual Link's current screen, cached per epoch. */
const detectFor = (state: EngineState, cache: DetectCache): DetectedScreen | null => {
  // Keyed by entry REGION (quantized tile) too — a room re-entered through a
  // different door floods a different region and needs its own detection.
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
  return {
    ...base,
    grids: port.getScreenGrids(loc),
    interactables,
    itemReceived,
    exits: detectFor(state, cache)?.exits,
    reached: detectFor(state, cache)?.reached,
  };
};

/** Feeds the DetectedCheck an event carried into the recorder so unmatched checks surface as dataset suggestions. */
const recordDetectedCheck = (recorder: RecorderState, detected: DetectedCheck): void => {
  if (!detected.matchedName) return;
  const loc = locationForScreen(detected.at.screenId);
  recordCheck(recorder, {
    name: detected.matchedName,
    screenId: detected.at.screenId,
    roomId: loc?.roomId ?? 0,
    tile: detected.at.tile,
  });
};

/** Narrative events go to the store + log-bus; every event goes to the JSONL sink. */
const fanOutEvents = (
  events: SimEvent[],
  sink: SimLogSink,
  pushNarrative: (narrative: SimEvent[]) => void,
  recorder: RecorderState,
): void => {
  const narrative: SimEvent[] = [];
  for (const event of events) {
    sink.write(event);
    if (event.level === 'narrative') {
      narrative.push(event);
      log.sim(event.msg);
    }
    const detected = (event.data as { detected?: DetectedCheck } | undefined)?.detected;
    if (detected) recordDetectedCheck(recorder, detected);
  }
  if (narrative.length > 0) pushNarrative(narrative);
};

/** Per-screen flood stats as a narrative log event (from the cached detection). */
const screenFloodEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const flood = detectFor(state, cache)?.flood;
  if (!flood) return null;
  const intra = flood.intraCount > 0 ? ` (+${flood.intraCount} int)` : '';
  return {
    level: 'narrative',
    msg: `flood ${screenLabel(state.virtual.screenId)}: reachable ${flood.reachableCount}/${flood.totalTiles}, entrances ${flood.entranceCount}, edges ${flood.edgeCount}${intra}`,
    step: state.step,
  };
};

/** Detected exits with their walk-step distances — the closest-first evidence. */
const exitsEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const exits = detectFor(state, cache)?.exits;
  if (!exits || exits.length === 0) return null;
  const fmt = exits.map((e) => {
    const raw = e.steps ?? 0xffff;
    const leaves = raw >= 0x1000 && raw < 0xf000; // biased but reachable
    const base = leaves ? raw - 0x1000 : raw;
    const steps = base >= 0xf000 ? '?' : String(base);
    const at = e.fromTile ? ` [${e.fromTile.col},${e.fromTile.row}]` : '';
    return `${screenLabel(e.to)}${at} (${steps} steps${leaves ? ', leaves area' : ''})`;
  });
  return { level: 'narrative', msg: `Exits by walk distance: ${fmt.join(', ')}`, step: state.step };
};

/** "Sequence <phase>" marker when the game's progress phase differs from the last seen. */
const sequenceEvent = (lastLabel: string | null, step: number): SimEvent | null => {
  const label = wasmGetProgressIndicator()?.label ?? null;
  if (!label || label === lastLabel) return null;
  return { level: 'narrative', msg: `Sequence ${label}`, step };
};

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** ~2 frames so the game advances the trigger / item grant before the next step. */
const waitAfterTrigger = async (): Promise<void> => {
  await nextFrame();
  await nextFrame();
};

export { buildObservation, fanOutEvents, waitAfterTrigger, screenFloodEvent, exitsEvent, sequenceEvent };
export type { SimLogSink, DetectCache };
