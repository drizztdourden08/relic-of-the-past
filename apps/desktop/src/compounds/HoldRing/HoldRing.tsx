/* @layer renderer-app @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ProgressRing } from '@app/primitives/ProgressRing';
import { RING_SIZE } from './HoldRing.constants';
import type { HoldRingProps } from './HoldRing.type';
import './HoldRing.css';

const HoldRing = (props: HoldRingProps) => {
  const { center, progress, label } = props;
  const half = RING_SIZE / 2;

  return (
    <Box className="hold-ring" style={{ left: center.x - half, top: center.y - half, width: RING_SIZE }}>
      <Text className="hold-ring__label">{label}</Text>
      <ProgressRing className="hold-ring__arc" size={RING_SIZE} progress={progress} />
    </Box>
  );
};

export { HoldRing };
