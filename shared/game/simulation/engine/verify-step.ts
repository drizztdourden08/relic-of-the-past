/* @layer shared-game @kind logic */
/**
 * The verifying phase: diff the flag snapshots around the trigger, name the
 * check, fold in the item, and route the side-effect cycles — door unlocks,
 * shutter clears and trap slams — each of which re-floods the room in place.
 */
import type { SimObservation, SimEvent, DetectedCheck } from '../types';
import { ITEM_ID_TO_NAME } from '../../items/id-map';
import { diffSnapshots, emptySnapshot } from '../detect/flag-snapshot';
import { matchDiffs, UNKNOWN } from '../detect/check-matcher';
import { onCheckVerified } from './explorer';
import { narrative, debug, emitDoorUnlock, emitShutterClear, emitSwitchPulled, emitTrapClosed, emitFollower , emitWallBombed } from './step-helpers';
import type { EngineState } from './state';

const verifyStep = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  const diffs = diffSnapshots(s.preTrigger ?? emptySnapshot(), obs.flags);
  const target = s.currentTarget;

  // No flag change → nothing observable; mark failed so this epoch skips it.
  // A blast changes no game state, so it can never show a diff — settle it first
  // or the no-diff branch below would mark the wall permanently failed.
  if (target?.action.type === 'bombWall') { emitWallBombed(s, events, target.key, target.label); return; }

  if (diffs.length === 0) {
    if (target) { s.failed.add(target.key); events.push(debug(s, `trigger produced no flag change: ${target.label}`)); }
    s.currentTarget = undefined;
    s.preTrigger = undefined;
    s.phase = 'observing';
    return;
  }

  if (target?.action.type === 'trapShutters') { emitTrapClosed(s, events, target.action.roomId); return; }
  if (target?.action.type === 'pullSwitch') { emitSwitchPulled(s, events, target.key, target.action.roomId, target.action.drain); return; }
  if (target?.action.type === 'progress' && target.action.step === 'follower-join') { emitFollower(s, events, target.key); return; }
  if (target?.action.type === 'door') { emitDoorUnlock(s, events, target.label, target.key, target.action.doorKind === 'small-key'); return; }
  if (target?.action.type === 'kill' && target.action.opensShutters && target.action.itemId === 0xff) { emitShutterClear(s, events, target.label, target.key); return; }
  const { name, matched } = matchDiffs(diffs);
  const itemReceived = obs.itemReceived !== undefined ? ITEM_ID_TO_NAME[obs.itemReceived] : undefined;
  const epochBefore = s.epoch;
  const detected: DetectedCheck = { evidence: diffs, matched, matchedName: name, itemReceived, at: s.virtual };

  if (target) s.done.add(target.key);
  onCheckVerified(s, detected, events);

  const stopId = s.config.stopAtCheckId;
  if (stopId && (matched?.id === stopId || name === stopId)) s.stopHit = true;

  const shown = name === UNKNOWN && target ? target.label : name;
  if (itemReceived) events.push(narrative(s, shown !== UNKNOWN ? `Got "${itemReceived}" (${shown})` : `Got "${itemReceived}"`));
  events.push({ ...narrative(s, `Verified ${shown}`), data: { detected } });
  // A drop-kill that satisfied the room's kill tag (last living killable)
  // reopens the trap shutters the game closed behind the player.
  if (target?.action.type === 'kill' && target.action.opensShutters && target.action.itemId !== 0xff) {
    s.trapClosed.delete(target.screenId);
    events.push(narrative(s, `Defeated ${target.label} — shutter doors reopened`));
  }
  // A traversal-affecting unlock re-seeds the frontier; the runner re-floods after
  // this. When this check IS the stop target, skip straight to planning — the run
  // must end on the verification, with no reset/re-flood/discovery after it.
  if (s.epoch > epochBefore && !s.stopHit) events.push(narrative(s, 'Reset: restarting from current position with new state'));

  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = s.stopHit ? 'planning' : 'observing';
};

export { verifyStep };
