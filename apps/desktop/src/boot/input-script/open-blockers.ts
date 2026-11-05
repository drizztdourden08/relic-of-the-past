/* @layer renderer-app @kind logic */
import { canReceive, getState } from '@rotp/randomizer';
import { pollSyncOpen } from '@app/randomizer/rotp-randomizer/poll-sync-open';
import { BLOCKER_NOT_IN_PLAIN_PLAY, BLOCKER_RECEIPTS_QUEUED, BLOCKER_SYNC_PENDING } from './input-script.constants';

const openBlockers = (): string[] => {
  const blockers: string[] = [];
  if (pollSyncOpen()) blockers.push(BLOCKER_SYNC_PENDING);
  const { pending, delivering } = getState();
  const queued = pending.length + (delivering ? 1 : 0);
  if (queued > 0) blockers.push(`${queued} ${BLOCKER_RECEIPTS_QUEUED}`);
  if (!canReceive()) blockers.push(BLOCKER_NOT_IN_PLAIN_PLAY);
  return blockers;
};

export { openBlockers };
