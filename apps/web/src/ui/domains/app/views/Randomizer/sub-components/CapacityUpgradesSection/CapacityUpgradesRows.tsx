/* @layer renderer-components @kind component */
/**
 * The derived half of the section: the four row models of the profile,
 * rendered through CapacityUpgradesBlock. Kept apart from the section so the
 * derivation runs inside its fence, so a throw here reaches the boundary, not
 * the page.
 */
import { CapacityUpgradesBlock } from '@domains/app/compounds/CapacityUpgradesBlock';
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY } from '@shared/randomizer/ap-world/capacity';
import { apOptionByKey } from '@shared/randomizer/ap-world/options.data';
import { useCapacityRows } from '../../../../../../../hooks/randomizer/useCapacityRows';
import type { CapacityUpgradesSectionProps } from './CapacityUpgradesSection.type';

type CapacityUpgradesRowsProps = Omit<CapacityUpgradesSectionProps, 'onReset'>;

const ENABLED_OPTION = apOptionByKey.get(CAPACITY_ENABLED_KEY);
const PROGRESSIVE_OPTION = apOptionByKey.get(CAPACITY_PROGRESSIVE_KEY);

const CapacityUpgradesRows = (props: CapacityUpgradesRowsProps) => {
  const {
    profile, fillerHeadroom, notes, enabled = true, progressive, forced, walletFloor, bonus, readOnly = false,
    onChange, onBonusChange, onEnabledChange, onProgressiveChange,
  } = props;
  const rows = useCapacityRows({ profile, fillerHeadroom, progressive, forced, walletFloor, bonus });
  return (
    <CapacityUpgradesBlock
      rows={rows}
      notes={notes}
      enabledOption={ENABLED_OPTION}
      enabled={enabled}
      progressiveOption={PROGRESSIVE_OPTION}
      progressive={progressive}
      readOnly={readOnly}
      onChange={onChange}
      onBonusChange={onBonusChange}
      onEnabledChange={onEnabledChange}
      onProgressiveChange={onProgressiveChange}
    />
  );
};

export { CapacityUpgradesRows };
export type { CapacityUpgradesRowsProps };
