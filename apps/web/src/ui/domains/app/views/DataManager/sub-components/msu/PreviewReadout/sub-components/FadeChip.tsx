/* @layer renderer-components @kind component */
/**
 * The marker at the end of a voice's row while that sound is crossfading: which way it is heading,
 * how long is left, and a short bar filling towards the moment the fade completes.
 *
 * It sits at the end of the row rather than replacing the position reading, because both are true
 * at once — the sound is still advancing through its file while its level is on the move. During a
 * loop's overlap two rows carry one of these each, in opposite directions, which is what makes the
 * crossfade visible as an event rather than as a seam.
 */
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
