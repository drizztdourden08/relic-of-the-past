/* @layer renderer-components @kind types */
import type { CapacityProfile, WalletFloor } from '@rotp/randomizer';
import type { ReconciledCapacityPond } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

interface CapacityTabBodyProps {
  choices: RandomizerOptionChoices;
  rule: ReconciledCapacityPond;
  capacity: CapacityProfile;
  walletFloor: WalletFloor;
  notes: readonly string[];
  fillerHeadroom: number | null;
  onChange?: (next: RandomizerOptionChoices) => void;
}

export type { CapacityTabBodyProps };
