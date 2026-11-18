/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { RATIO_OPTIONS } from './RatioPicker.constants';
import type { RatioPickerProps } from './RatioPicker.type';
import { useT } from '@drizztdourden08/brock-react';

const RatioPicker = (props: RatioPickerProps) => {
  const t = useT();
  const { value, onChange } = props;

  return (
    <Box className="hud-toolbar__field">
      <Text className="hud-toolbar__field-label">{t('hud-editor:ratio-picker.text.ratio')}</Text>
      <SegmentedControl size="sm" aria-label={t('hud-editor:ratio-picker.aria.ratio')} value={value} options={RATIO_OPTIONS} onChange={onChange} />
    </Box>
  );
};

export { RatioPicker };
