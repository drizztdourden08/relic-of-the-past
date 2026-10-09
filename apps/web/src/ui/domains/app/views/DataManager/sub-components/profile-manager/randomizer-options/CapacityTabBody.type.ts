/* @layer renderer-components @kind types */
import type { CapacityProfile, WalletFloor } from '@shared/randomizer/world/capacity';
import type { ReconciledCapacityPond } from '@shared/randomizer/world/capacity-pond';
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
