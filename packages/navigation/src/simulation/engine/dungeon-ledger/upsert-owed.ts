/* @layer shared-game @kind logic */
import type { DungeonLedger } from './dungeon-ledger.type';

const upsertOwed = (ledger: DungeonLedger, checkId: string, roomId: number, blockedBy?: string): void => {
  const existing = ledger.owed.find(o => o.checkId === checkId);
  if (existing) { existing.blockedBy = blockedBy; return; }
  ledger.owed.push({ checkId, roomId, blockedBy });
};

export { upsertOwed };
