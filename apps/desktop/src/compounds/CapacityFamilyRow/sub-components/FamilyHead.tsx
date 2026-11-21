/* @layer renderer-components @kind component */
import { Box, Select, Text } from '@drizztdourden08/tessera/primitives';
import { ValueTag } from '@drizztdourden08/tessera/composites';
import { OptionDescription } from '../../OptionDescription';
import { choiceLabelOf } from '@app/hooks/randomizer/option-labels';
import { PoolImpactCell } from '../../PoolImpactCell';
import { useT } from '@drizztdourden08/brock-react';
import { modeOptions, walletModeOptions } from '../CapacityFamilyRow.constants';
import type { CapacityRowState, FamilyHeadProps } from '../CapacityFamilyRow.type';

const FamilyHead = ({ model, readout, disabled, onPick }: FamilyHeadProps) => {
  const { label, caption, offersInPool, state, impact } = model;
  const t = useT();

  return (
    <Box className="capacity-row__head">
      <Box className="capacity-row__text">
        <Text className="capacity-row__label">{label}</Text>
        {caption !== undefined && <OptionDescription className="capacity-row__caption" description={caption} />}
      </Box>
      <Box className="capacity-row__mode">
        {readout ? <ValueTag value={choiceLabelOf(modeOptions(t), state.mode)} /> : (
          <Select
            size="sm"
            value={state.mode}
            options={(offersInPool ? modeOptions(t) : walletModeOptions(t))}
            onChange={(mode) => onPick(mode as CapacityRowState['mode'])}
            disabled={disabled}
          />
        )}
      </Box>
      <PoolImpactCell cell={impact} />
    </Box>
  );
};

export { FamilyHead };
