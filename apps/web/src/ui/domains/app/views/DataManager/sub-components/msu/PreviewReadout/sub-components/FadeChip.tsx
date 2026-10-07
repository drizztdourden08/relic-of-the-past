/* @layer renderer-components @kind component */
// Sits beside the position reading, not in place of it: the sound still advances while its level moves.
import { Box } from '@ds/primitives/Box';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
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
        variant={fade.kind === 'in' ? 'green' : 'gold'}
      />
    </Box>
  );
};

export { FadeChip };
