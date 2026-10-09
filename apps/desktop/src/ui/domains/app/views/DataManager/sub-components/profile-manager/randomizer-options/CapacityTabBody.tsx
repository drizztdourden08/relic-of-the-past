/* @layer renderer-components @kind component */
import { CapacityUpgradesSection } from '@domains/app/views/Randomizer/sub-components/CapacityUpgradesSection';
import { REFERENCE_CAPACITY_PROFILE } from '@rotp/randomizer';
import { applyRowChange } from '@app/hooks/randomizer/capacity-row-state';
import { withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import type { CapacityTabBodyProps } from './CapacityTabBody.type';

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
