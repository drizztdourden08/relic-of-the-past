/* @layer renderer-components @kind component */
/**
 * The capacity tab: the four families under their master and progressive
 * switches, drawn from the pair the capacity/pond rule allows instead of the
 * raw choices, so an edit on either side re-points the other. Every edit
 * leaves through the rule. A read-only panel passes no edit builder's
 * handlers, and the section draws every value as a tag.
 */
import { CapacityUpgradesSection } from '@domains/app/views/Randomizer/sub-components/CapacityUpgradesSection';
import { REFERENCE_CAPACITY_PROFILE } from '@shared/randomizer/world/capacity';
import { applyRowChange } from '@app/hooks/randomizer/capacity-row-state';
import { withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import type { CapacityProfile, WalletFloor } from '@shared/randomizer/world/capacity';
import type { ReconciledCapacityPond } from '@shared/randomizer/world/capacity-pond';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

interface CapacityTabBodyProps {
  choices: RandomizerOptionChoices;
  /** The pair after the capacity/pond rule has settled it. */
  rule: ReconciledCapacityPond;
  /** The families with the wallet's final cap already held to the floor. */
  capacity: CapacityProfile;
  walletFloor: WalletFloor;
  notes: readonly string[];
  fillerHeadroom: number | null;
  /** Absent draws the tab read-only. */
  onChange?: (next: RandomizerOptionChoices) => void;
}

const CapacityTabBody = (props: CapacityTabBodyProps) => {
  const { choices, rule, capacity, walletFloor, notes, fillerHeadroom, onChange } = props;

  const shared = {
    profile: capacity,
    fillerHeadroom,
    notes: [...notes, ...rule.notes],
    enabled: rule.enabled,
    progressive: choices.capacityProgressive,
    forced: rule.forcedFamilies,
    walletFloor,
    bonus: choices.capacityBonus,
  };

  if (onChange === undefined) return <CapacityUpgradesSection {...shared} readOnly />;

  return (
    <CapacityUpgradesSection
      {...shared}
      onChange={(family, next) => onChange(withCapacityPondRule(
        { ...choices, capacity: applyRowChange(capacity, family, next, walletFloor) }, family,
      ))}
      onBonusChange={(family, next) => onChange({
        ...choices, capacityBonus: { ...choices.capacityBonus, [family]: next },
      })}
      onEnabledChange={(capacityEnabled) => onChange({ ...choices, capacityEnabled })}
      onProgressiveChange={(capacityProgressive) => onChange({ ...choices, capacityProgressive })}
      onReset={() => onChange(withCapacityPondRule(
        { ...choices, capacity: REFERENCE_CAPACITY_PROFILE }, 'capacity',
      ))}
    />
  );
};

export { CapacityTabBody };
export type { CapacityTabBodyProps };
