/* @layer shared-game @kind logic */
import type { SimObservation, SimEvent, DetectedCheck } from '../types';
import { getItem } from '@rotp/game-data';
import type { CheckRecord, ItemId } from '@rotp/game-data';
import { diffSnapshots } from '../detect/flag-snapshot/diff-snapshots';
import { emptySnapshot } from '../detect/flag-snapshot/empty-snapshot';
import { matchDiffs } from '../detect/check-matcher/match-diffs';
import { UNIDENTIFIED } from '../detect/unidentified.constants';
import { onCheckVerified } from './explorer/on-check-verified';
import { narrative } from './event-log/narrative';
import { debug } from './event-log/debug';
import { emitDoorUnlock } from './side-effects/emit-door-unlock';
import { emitShutterClear } from './side-effects/emit-shutter-clear';
import { emitSwitchPulled } from './side-effects/emit-switch-pulled';
import { emitTrapClosed } from './side-effects/emit-trap-closed';
import { emitFollower } from './side-effects/emit-follower';
import { emitWallBombed } from './side-effects/emit-wall-bombed';
import { ROOM_CLEAR_KILL_ITEM } from './engine.constants';
import type { EngineState, SimTarget } from './state/state.type';

const markFailed = (s: EngineState, events: SimEvent[], target: SimTarget | undefined): void => {
  if (target) { s.failed.add(target.key); events.push(debug(s, `trigger produced no flag change: ${target.label}`)); }
  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = 'observing';
};

const settleSideEffect = (s: EngineState, events: SimEvent[], target: SimTarget | undefined): boolean => {
  const action = target?.action;
  if (!target || !action) return false;
  if (action.type === 'trapShutters') { emitTrapClosed(s, events, action.roomId); return true; }
  if (action.type === 'pullSwitch') { emitSwitchPulled(s, events, target.key, action.roomId, action.drain); return true; }
  if (action.type === 'progress' && action.step === 'follower-join') { emitFollower(s, events, target.key); return true; }
  if (action.type === 'door') { emitDoorUnlock(s, events, target.label, target.key, action.doorKind === 'small-key'); return true; }
  if (action.type === 'kill' && action.opensShutters && action.itemId === ROOM_CLEAR_KILL_ITEM) { emitShutterClear(s, events, target.label, target.key); return true; }
  return false;
};

const narrateVerified = (s: EngineState, events: SimEvent[], detected: DetectedCheck, target: SimTarget | undefined): void => {
  const { matched, itemReceived } = detected;
  const shown = matched ? matched.name : target?.label ?? UNIDENTIFIED;
  if (itemReceived) {
    const itemName = getItem(itemReceived).name;
    events.push(narrative(s, matched || target ? `Got "${itemName}" (${shown})` : `Got "${itemName}"`));
  }
  events.push({ ...narrative(s, `Verified ${shown}`), data: { detected } });
};

const isDropKillThatReopens = (target: SimTarget | undefined): boolean =>
  target?.action.type === 'kill' && target.action.opensShutters && target.action.itemId !== ROOM_CLEAR_KILL_ITEM;

const detectedCheckOf = (s: EngineState, evidence: DetectedCheck['evidence'], matched: CheckRecord | undefined, itemReceived: ItemId | undefined): DetectedCheck =>
  ({ evidence, matched, checkId: matched?.id, itemReceived, at: s.virtual });

const verifyStep = (s: EngineState, obs: SimObservation, events: SimEvent[]): void => {
  const diffs = diffSnapshots(s.preTrigger ?? emptySnapshot(), obs.flags);
  const target = s.currentTarget;

  if (target?.action.type === 'bombWall') { emitWallBombed(s, events, target.key, target.label); return; }
  if (diffs.length === 0) { markFailed(s, events, target); return; }
  if (settleSideEffect(s, events, target)) return;

  const matched = matchDiffs(diffs);
  const epochBefore = s.epoch;
  const detected = detectedCheckOf(s, diffs, matched, obs.itemReceived);

  if (target) s.done.add(target.key);
  onCheckVerified(s, detected, events);

  if (s.config.stopAtCheckId && matched?.id === s.config.stopAtCheckId) s.stopHit = true;

  narrateVerified(s, events, detected, target);
  if (target && isDropKillThatReopens(target)) {
    s.trapClosed.delete(target.screenId);
    events.push(narrative(s, `Defeated ${target.label} and the shutter doors reopened`));
  }
  if (s.epoch > epochBefore && !s.stopHit) events.push(narrative(s, 'Reset: restarting from current position with new state'));

  s.currentTarget = undefined;
  s.preTrigger = undefined;
  s.phase = s.stopHit ? 'planning' : 'observing';
};

export { verifyStep };
