/* @layer renderer-components @kind component */
import { Box, Select, Text } from '@drizztdourden08/tessera/primitives';
import { OptionDescription } from '../../OptionDescription';
import { OptionValueTag, choiceLabelOf } from '../../OptionValueTag';
import { PoolImpactCell } from '../../PoolImpactCell';
import { MODE_OPTIONS, WALLET_MODE_OPTIONS } from '../CapacityFamilyRow.constants';
import type { CapacityRowState, FamilyHeadProps } from '../CapacityFamilyRow.type';

const FamilyHead = ({ model, readout, disabled, onPick }: FamilyHeadProps) => {
  const { label, caption, offersInPool, state, impact } = model;

  return (
    <Box className="capacity-row__head">
      <Box className="capacity-row__text">
        <Text className="capacity-row__label">{label}</Text>
        {caption !== undefined && <OptionDescription className="capacity-row__caption" description={caption} />}
      </Box>
      <Box className="capacity-row__mode">
        {readout ? <OptionValueTag value={choiceLabelOf(MODE_OPTIONS, state.mode)} /> : (
          <Select
            size="sm"
            value={state.mode}
            options={(offersInPool ? MODE_OPTIONS : WALLET_MODE_OPTIONS)}
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
