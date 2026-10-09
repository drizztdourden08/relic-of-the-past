/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { TONE_CLASS } from '../DragGhost.constants';
import type { GhostCardProps } from '../DragGhost.type';

const GhostCard = (props: GhostCardProps) => {
  const { model, style } = props;
  return (
    <Box className={`hud-ghost${TONE_CLASS[model.tone]}`} style={style} aria-hidden>
      <Box className="hud-ghost__l1">
        <Text className="hud-ghost__chip">{model.chip}</Text>
        <Text className="hud-ghost__kind">{model.kind}</Text>
      </Box>
      <Text className="hud-ghost__l2">{model.position}</Text>
      <Text className={`hud-ghost__l3${model.warn ? ' is-warn' : ''}`}>{model.path}</Text>
    </Box>
  );
};

export { GhostCard };
