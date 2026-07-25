/* @layer shared-game @kind logic */
/**
 * Stateless helpers for the step machine: event constructors, edge key-spending,
 * and the tile the virtual player lands on when crossing an edge.
 */
import type { SimEvent, SimExit, SimObservation, TriggerAction } from '../types';
import type { GridPos } from '../../navigation/types';
import { SCREEN_BY_ID, displayName } from '../../data/screens';
import { cloneSnapshot } from '../detect/flag-snapshot';
import type { ScreenEdge } from './traversal';
import { spendKey, spendAnyKey, localRefresh, globalRefresh } from './explorer';
import { KILL_GATE_TAG } from './discover';
import type { EngineState, SimTarget } from './state';

const SCREEN_CENTER: GridPos = { row: 32, col: 32 };

/** Screen id plus its dataset display name for the log: `lw-2c (Uncle Estate)`.
 *  Display only — traversal never consults the dataset. Unknown ids stay bare. */
const screenLabel = (id: string): string => {
  const screen = SCREEN_BY_ID.get(id);
  return screen ? `${id} (${displayName(id, screen.name)})` : id;
};

/** "Found chest at 12,20" when the tile is known, else falls back to the room. */
const foundMsg = (target: SimTarget): string =>
  target.tile
    ? `Found ${target.noun} at ${target.tile.col},${target.tile.row}`
    : `Found ${target.noun} (room ${target.roomId.toString(16)})`;

const narrative = (s: EngineState, msg: string): SimEvent => ({ level: 'narrative', msg, step: s.step });
const debug = (s: EngineState, msg: string, data?: unknown): SimEvent => ({ level: 'debug', msg, step: s.step, data });

const spendKeysForEdge = (s: EngineState, edge: ScreenEdge): void => {
  for (const group of edge.requirements) {
    for (const token of group) {
      if (token.startsWith('smallkey:')) spendKey(s, token.slice('smallkey:'.length));
    }
  }
};

/** Where the virtual player lands when crossing an edge — the connection's entry point, else screen centre. */
const entryTileFor = (edge: ScreenEdge): GridPos => edge.connection.nav?.toPoint?.position ?? SCREEN_CENTER;

const posMsg = (label: 'START' | 'END', tile: GridPos): string => `${label} at ${tile.col},${tile.row}`;

/** Where the virtual player lands crossing a hop (discovered exit or static edge). */
const landingTile = (exit?: SimExit, edge?: ScreenEdge): GridPos =>
  exit ? (exit.entryTile ?? SCREEN_CENTER) : entryTileFor(edge!);

/**
 * Full narration for one screen hop: END position (the tile the player leaves
 * from), Exiting (with big-area via), area enter/leave markers, Screen entry,
 * START position (the tile the player lands on). Mutates s.virtual and s.area.
 */
const emitHop = (s: EngineState, events: SimEvent[], next: string, exit?: SimExit, edge?: ScreenEdge): void => {
  const from = s.virtual.screenId;
  events.push(narrative(s, posMsg('END', exit?.fromTile ?? s.virtual.tile)));
  const via = exit?.via && exit.via !== from ? ` via ${screenLabel(exit.via)}` : '';
  events.push(narrative(s, `Exiting ${screenLabel(from)}${via}`));
  const destArea = exit?.area;
  if (s.area?.key !== destArea?.key) {
    if (s.area) events.push(narrative(s, `Leaving area ${s.area.label}`));
    if (destArea) events.push(narrative(s, `Area ${destArea.label} (${destArea.size} sub-screens)`));
    s.area = destArea;
  }
  const tile = landingTile(exit, edge);
  s.virtual = { screenId: next, tile };
  events.push(narrative(s, `Screen ${screenLabel(next)}`));
  events.push(narrative(s, posMsg('START', tile)));
};

/** A door unlock is state progress, not a check: spend the key, log it, and
 *  reset the frontier so reachability re-floods through the opened door. */
const emitDoorUnlock = (s: EngineState, events: SimEvent[], label: string, key: string, spendsKey: boolean): void => {
  if (spendsKey) spendAnyKey(s);
  s.done.add(key);
  events.push(narrative(s, `Unlocked ${label}`));
  localRefresh(s);
  events.push(narrative(s, `Reset: re-flooding ${screenLabel(s.virtual.screenId)} with new state`));
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

/** A pulled switch raised the room's trapdoors — re-flood in place. */
const emitSwitchPulled = (s: EngineState, events: SimEvent[], key: string, roomId: number): void => {
  s.done.add(key);
  events.push(narrative(s, `Pulled switch (room ${roomId.toString(16)}) — shutter doors opened`));
  localRefresh(s);
  events.push(narrative(s, `Reset: re-flooding ${screenLabel(s.virtual.screenId)} with new state`));
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

/** Room-clear kill trigger verified: the shutters are open — re-flood in place. */
const emitShutterClear = (s: EngineState, events: SimEvent[], label: string, key: string): void => {
  s.done.add(key);
  events.push(narrative(s, `Defeated ${label} — shutter doors opened`));
  localRefresh(s);
  events.push(narrative(s, `Reset: re-flooding ${screenLabel(s.virtual.screenId)} with new state`));
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

/** The follower now tags along: state progress, not a check. Her tagalong unlocks
 *  the throne room's passage — a REMOTE screen — so the whole graph re-opens. */
const emitFollower = (s: EngineState, events: SimEvent[], key: string): void => {
  s.done.add(key);
  s.events.add('event:follower-joined');
  events.push(narrative(s, 'The follower is tagging along'));
  globalRefresh(s);
  events.push(narrative(s, 'Reset: re-exploring with the follower tagging along'));
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

/** How close (tiles, chebyshev) a shutter must sit to the player's landing tile
 *  to count as the door just walked through. */
const TRAP_ENTRY_RADIUS = 8;

/** Arriving beside a closed shutter in a kill-tag room: it just slammed shut
 *  behind the player — narrate it (the flood's edges-0 line is the hard evidence). */
const emitEntryTrapSlam = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  const inter = obs.interactables;
  if (!inter || !(inter.tags ?? [0, 0]).some(KILL_GATE_TAG)) return;
  const near = inter.doors.find((d) => d.kind === 'shutter' && !d.opened && d.tiles.some((t) =>
    Math.abs(t.row - s.virtual.tile.row) <= TRAP_ENTRY_RADIUS && Math.abs(t.col - s.virtual.tile.col) <= TRAP_ENTRY_RADIUS));
  if (near) events.push(narrative(s, `Shutter door slammed shut behind the player (room ${near.roomId.toString(16)})`));
};

/**
 * Interacting inside a still-hostile trap section slams every open shutter shut
 * FIRST: the player walks in (the virtual tile moves to the target), the real target
 * is requeued, and the slam runs as its own trigger/verify cycle. Returns true
 * when the interception consumed this step.
 */
const interceptTrap = (s: EngineState, obs: SimObservation, events: SimEvent[], actions: TriggerAction[]): boolean => {
  const target = s.currentTarget;
  if (!target?.trap || s.trapClosed.has(target.screenId)) return false;
  s.trapClosed.add(target.screenId);
  s.pending.unshift(target);
  if (target.tile) s.virtual = { ...s.virtual, tile: target.tile };
  const noun = `${target.noun}'s section`;
  s.currentTarget = { screenId: target.screenId, roomId: target.roomId, key: `trap:${target.screenId}`, action: { type: 'trapShutters', roomId: target.roomId }, label: noun, noun, verb: 'Walking into' };
  s.preTrigger = cloneSnapshot(obs.flags);
  actions.push(s.currentTarget.action);
  events.push(narrative(s, `Walking into ${target.noun}'s section`));
  s.phase = 'verifying';
  return true;
};

/** The slam verified (door-open bits dropped): narrate + re-flood in place. */
const emitTrapClosed = (s: EngineState, events: SimEvent[], roomId: number): void => {
  events.push(narrative(s, `Shutter doors slammed shut behind the player (room ${roomId.toString(16)})`));
  localRefresh(s);
  events.push(narrative(s, `Reset: re-flooding ${screenLabel(s.virtual.screenId)} with new state`));
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

export { narrative, debug, foundMsg, screenLabel, posMsg, landingTile, emitHop, spendKeysForEdge, emitDoorUnlock, emitShutterClear, emitSwitchPulled, emitEntryTrapSlam, emitFollower, interceptTrap, emitTrapClosed, entryTileFor, SCREEN_CENTER };
