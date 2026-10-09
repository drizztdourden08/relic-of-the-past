/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { RATIO_OPTIONS } from './RatioPicker.constants';
import type { RatioPickerProps } from './RatioPicker.type';

const RatioPicker = (props: RatioPickerProps) => {
  const { value, onChange } = props;

  return (
    <Box className="hud-toolbar__field">
      <Text className="hud-toolbar__field-label">Ratio</Text>
      <SegmentedControl size="sm" aria-label="Ratio" value={value} options={RATIO_OPTIONS} onChange={onChange} />
    </Box>
  );
};

export { RatioPicker };
export type { RatioPickerProps } from './RatioPicker.type';
