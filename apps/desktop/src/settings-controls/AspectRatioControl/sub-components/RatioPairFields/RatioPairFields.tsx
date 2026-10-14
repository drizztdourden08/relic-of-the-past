/* @layer renderer-components @kind component */
import { NumberInput, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { RatioPairFieldsProps } from './RatioPairFields.type';
import './RatioPairFields.css';

const RatioPairFields = (props: RatioPairFieldsProps) => {
  const { w, h, check, onWidth, onHeight } = props;
  return (
    <Box className="ratio-pair-fields">
      <Box className="ratio-pair-fields__row">
        <NumberInput buttons="sides" aria-label="Ratio width" min={1} step={1} value={w} onChange={onWidth} />
        <Text className="ratio-pair-fields__sep">:</Text>
        <NumberInput buttons="sides" aria-label="Ratio height" min={1} step={1} value={h} onChange={onHeight} />
      </Box>
      {!check.valid && <Text className="ratio-pair-fields__error">{check.error}</Text>}
    </Box>
  );
};

export { RatioPairFields };
