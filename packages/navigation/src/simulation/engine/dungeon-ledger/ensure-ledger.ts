/* @layer shared-game @kind logic */
import type { DungeonLedger } from './dungeon-ledger.type';

const emptyLedger = (group: number): DungeonLedger => ({
  group,
  owed: [],
  exhausted: false,
  complete: false,
  reopensOn: [],
});

const ensureLedger = (ledgers: Map<number, DungeonLedger>, group: number): DungeonLedger => {
  let ledger = ledgers.get(group);
  if (!ledger) { ledger = emptyLedger(group); ledgers.set(group, ledger); }
  return ledger;
};

export { ensureLedger };
