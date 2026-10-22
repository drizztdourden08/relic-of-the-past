/* @layer renderer-components @kind types */
import type { ProgressiveFamilyId } from '@rotp/randomizer';

interface ProgressiveRung {
  key: string;
  label: string;
  index: number;
  checked: boolean;
  sprite?: string;
}

interface ProgressiveLadder {
  id: ProgressiveFamilyId;
  name: string;
  countText: string;
  rungs: readonly ProgressiveRung[];
  noneOn: boolean;
  mode: string;
}

export type { ProgressiveLadder, ProgressiveRung };
