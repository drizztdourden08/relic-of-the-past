/* @layer shared-game @kind logic */
import type { DungeonLedger } from './dungeon-ledger.type';

const pruneDoneChecks = (ledger: DungeonLedger, done: ReadonlySet<string>): void => {
  ledger.owed = ledger.owed.filter(o => !done.has(o.checkId));
};

export { pruneDoneChecks };
