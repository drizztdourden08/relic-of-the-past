/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import type { FadeChipProps } from '../PreviewReadout.type';

const FadeChip = (props: FadeChipProps) => {
  const { fade } = props;

  return (
    <Box className="layer-meter__fade" data-fade={fade.kind}>
      <Text className="layer-meter__fade-label">{fade.label}</Text>
      <ProgressBar
        className="layer-meter__fade-bar"
        value={fade.fill}
        max={1}
        live
        tone={fade.kind === 'in' ? 'secondary' : 'primary'}
      />
    </Box>
  );
};

export { FadeChip };
