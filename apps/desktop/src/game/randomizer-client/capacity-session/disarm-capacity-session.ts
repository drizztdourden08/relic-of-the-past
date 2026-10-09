/* @layer bridge-wasm @kind logic */
import { clearCapacityProfile } from '../../capacity-profile';
import { clearCapacityBonus } from '../../capacity-bonus';
import { clearCapacityPlan } from '../../capacity-plan';
import { clearCapacityFixedLines } from '../../capacity-fixed-lines';
import { clearUpgradeIcons } from '../../upgrade-icons';
import { clearSessionWalletTable, setActiveCapacity } from '@rotp/randomizer';

const disarmCapacitySession = (): void => {
  setActiveCapacity(null);
  clearSessionWalletTable();
  clearUpgradeIcons();
  clearCapacityPlan();
  clearCapacityFixedLines();
  clearCapacityProfile();
  clearCapacityBonus();
};

export { disarmCapacitySession };
