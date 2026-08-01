/* @layer renderer-widgets @kind logic */
/**
 * Side helpers for the simulator runner: assembling a full SimObservation for
 * the virtual player's current screen (including the game-driven exits detected by
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
import { buildObservation, detectFor, floodItems, locationForScreen, waitAfterTrigger } from '../../../../../lib/game/simulator/observe';
import type { DetectCache } from '../../../../../lib/game/simulator/observe';

interface SimLogSink {
  write: (event: SimEvent) => void;
}

/** One detect per screen+epoch — the flood result feeds BOTH the log and traversal. */

/** Feeds the DetectedCheck an event carried into the recorder so unmatched checks
 *  surface as dataset suggestions — an unidentified diff records a null checkId,
 *  which is exactly what the suggestion builder looks for. */
const recordDetectedCheck = (recorder: RecorderState, detected: DetectedCheck): void => {
  const loc = locationForScreen(detected.at.screenId);
  recordCheck(recorder, {
    checkId: detected.checkId ?? null,
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
  // steps/stepsNote are already decoded from the ordering score (see
  // exit-order.decodeScore) — do not re-derive the bias here.
  const fmt = exits.map((e) => {
    const steps = e.steps !== undefined ? String(e.steps) : '?';
    const leaves = e.stepsNote === 'other-screen';
    const hop = e.stepsNote === 'via-hop' ? ', via hop' : '';
    const at = e.fromTile ? ` [${e.fromTile.col},${e.fromTile.row}]` : '';
    return `${screenLabel(e.to)}${at} (${steps} steps${leaves ? ', leaves area' : ''}${hop})`;
  });
  return { level: 'narrative', msg: `Exits by walk distance: ${fmt.join(', ')}`, step: state.step };
};

/** "Sequence <phase>" marker when the game's progress phase differs from the last seen. */
const sequenceEvent = (lastLabel: string | null, step: number): SimEvent | null => {
  const label = wasmGetProgressIndicator()?.label ?? null;
  if (!label || label === lastLabel) return null;
  return { level: 'narrative', msg: `Sequence ${label}`, step };
};

export { buildObservation, fanOutEvents, waitAfterTrigger, screenFloodEvent, exitsEvent, sequenceEvent };
export type { SimLogSink, DetectCache };
