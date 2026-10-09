/* @layer shared-game @kind logic */
import type { DetectedCheck, SimEvent } from '../../types';
import { getItem, dungeonForScreen } from '@rotp/game-data';
import { affectsTraversal } from '../../requirements-map/affects-traversal';
import { reopenLedgersFor } from '../dungeon-ledger-lifecycle/reopen-ledgers-for';
import type { EngineState } from '../state/state.type';
import { applyItem } from './apply-item';
import { localRefresh } from './local-refresh';
import { markDoneAndContinue } from './mark-done-and-continue';

const onCheckVerified = (state: EngineState, check: DetectedCheck, events: SimEvent[] = []): void => {
  if (check.itemReceived) {
    const dungeon = check.matched?.dungeonId ?? dungeonForScreen(state.virtual.screenId) ?? undefined;
    const gained = applyItem(state, check.itemReceived, dungeon);
    reopenLedgersFor(state, gained, getItem(check.itemReceived).name, events);
  }
  if (check.checkId) state.completedChecks.add(check.checkId);

  if (affectsTraversal(check.itemReceived, check.evidence)) localRefresh(state);
  markDoneAndContinue(state, check);
};

export { onCheckVerified };
