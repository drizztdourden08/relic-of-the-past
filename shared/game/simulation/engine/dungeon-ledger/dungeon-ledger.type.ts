/* @layer shared-game @kind types */
interface OwedCheck {
  checkId: string;
  roomId: number;
  blockedBy?: string;
}

interface DungeonLedger {
  group: number;
  owed: OwedCheck[];
  exhausted: boolean;
  complete: boolean;
  reopensOn: string[];
}

export type { OwedCheck, DungeonLedger };
