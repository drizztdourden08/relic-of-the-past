/* @layer shared-game @kind types */
import type { DungeonLedger } from './dungeon-ledger/dungeon-ledger.type';
import type { EngineState } from './state/state.type';

interface LedgerScan {
  state: EngineState;
  ledger: DungeonLedger;
  handled: Set<string>;
  blockerFor: (key: string) => string | undefined;
}

export type { LedgerScan };
