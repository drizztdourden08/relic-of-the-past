/* @layer renderer-widgets @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import type { LayerSlotView } from '../MusicWidget.type';
import './LayerSlot.css';

const LayerSlot = (props: { slot: LayerSlotView }) => {
  const { slot } = props;

  return (
    <Box className="layer-slot" data-empty={slot.empty ? 'yes' : 'no'} data-sounding={slot.sounding ? 'yes' : 'no'}>
      <Box className="layer-slot__pulse" />
      <Text className="layer-slot__name" title={slot.title || undefined}>{slot.name}</Text>
      <Text className="layer-slot__mode">{slot.mode}</Text>
      <Box className="layer-slot__bar">
        <ProgressBar value={slot.fill} max={1} live tone="secondary" />
      </Box>
      <Text className="layer-slot__label">{slot.label}</Text>
      <Text className="layer-slot__flag">{slot.flag}</Text>
    </Box>
  );
};

export { LayerSlot };
