/* @layer renderer-components @kind component */
import { CapacityUpgradesBlock } from '@app/compounds/CapacityUpgradesBlock';
import { useCapacityRows } from '../../../../../hooks/randomizer/useCapacityRows';
import { ENABLED_OPTION, PROGRESSIVE_OPTION } from './CapacityUpgradesRows.constants';
import type { CapacityUpgradesRowsProps } from './CapacityUpgradesRows.type';

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
