/* @layer renderer-widgets @kind logic */
/**
 * Side helpers for the simulator runner: assembling a full SimObservation for
 * the virtual Link's current screen, fanning events out to the store / log-bus /
 * JSONL sink (recording any DetectedCheck an event carries), and the inter-step
 * frame wait that lets the game process a trigger before the next observation
 * reads flags.
 */
import type { SimulatorPort, SimObservation, SimEvent, DetectedCheck, RecorderState } from '@shared/game/simulation';
import type { EngineState } from '@shared/game/simulation';
import { recordCheck } from '@shared/game/simulation';
import { log } from '@app/lib/log-bus';
import { locationForScreen } from './sim-location';

interface SimLogSink {
  write: (event: SimEvent) => void;
}

/** Pull grids + room interactables for the screen the virtual Link is exploring. */
const buildObservation = (port: SimulatorPort, state: EngineState, itemReceived?: number): SimObservation => {
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
      }
    : { chests: [], sprites: port.getOverworldSprites(loc.owScreenIndex), doors: [] };
  return {
    ...base,
    grids: port.getScreenGrids(loc),
    interactables,
    itemReceived,
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

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** ~2 frames so the game advances the trigger / item grant before the next step. */
const waitAfterTrigger = async (): Promise<void> => {
  await nextFrame();
  await nextFrame();
};

export { buildObservation, fanOutEvents, waitAfterTrigger };
export type { SimLogSink };
