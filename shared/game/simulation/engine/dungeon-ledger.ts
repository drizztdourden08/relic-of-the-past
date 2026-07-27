/* @layer shared-game @kind logic */
/**
 * The dungeon ledger: per dungeon-group bookkeeping of what a run still owes
 * there. `complete` is permanent — the group is fully cleared and never
 * reopens. `exhausted` is provisional — nothing owed is actionable right now,
 * but a listed acquisition (`reopensOn`) can undo it. Keeping the two states
 * distinct (rather than one boolean) is the point: a group can bounce between
 * exhausted and open again, but never leaves `complete` once it gets there.
 */

/** A check the run has seen in a dungeon group and not yet taken. */
interface OwedCheck {
  checkId: string;
  roomId: number;
  /** What stopped the run taking it — the missing token, or the gate it could not open. */
  blockedBy?: string;
}

interface DungeonLedger {
  group: number;
  owed: OwedCheck[];
  /** Nothing further is actionable with what is currently held. */
  exhausted: boolean;
  /** Only when `owed` is empty. Closes the group permanently. */
  complete: boolean;
  /** Requirements that would make returning worthwhile, gathered from `owed`. */
  reopensOn: string[];
}

const emptyLedger = (group: number): DungeonLedger => ({
  group,
  owed: [],
  exhausted: false,
  complete: false,
  reopensOn: [],
});

/** Get-or-create the ledger for a dungeon group. */
const ensureLedger = (ledgers: Map<number, DungeonLedger>, group: number): DungeonLedger => {
  let ledger = ledgers.get(group);
  if (!ledger) { ledger = emptyLedger(group); ledgers.set(group, ledger); }
  return ledger;
};

/** Add or refresh an owed entry's blocking reason. A check already struck off
 *  (see the caller's `done` filter) never re-enters through this. */
const upsertOwed = (ledger: DungeonLedger, checkId: string, roomId: number, blockedBy?: string): void => {
  const existing = ledger.owed.find(o => o.checkId === checkId);
  if (existing) { existing.blockedBy = blockedBy; return; }
  ledger.owed.push({ checkId, roomId, blockedBy });
};

/** Strike every owed entry the run has since taken. */
const pruneDoneChecks = (ledger: DungeonLedger, done: ReadonlySet<string>): void => {
  ledger.owed = ledger.owed.filter(o => !done.has(o.checkId));
};

export { ensureLedger, upsertOwed, pruneDoneChecks };
export type { OwedCheck, DungeonLedger };
