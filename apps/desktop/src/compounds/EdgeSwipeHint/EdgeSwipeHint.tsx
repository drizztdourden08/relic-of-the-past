/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { EDGE_HINTS } from './EdgeSwipeHint.constants';
import type { EdgeSwipeHintProps } from './EdgeSwipeHint.type';
import './EdgeSwipeHint.css';

const EdgeSwipeHint = (props: EdgeSwipeHintProps) => {
  const { startLabel, endLabel } = props;
  return (
    <Box className="edge-hint" aria-hidden="true">
      {EDGE_HINTS.map((hint) => (
        <Box key={hint.side} className="edge-hint__side" data-side={hint.side}>
          <Box className="edge-hint__strip" />
          <Box className="edge-hint__cue">
            <Icon name={hint.icon} />
            <Text className="edge-hint__label">{hint.side === 'start' ? startLabel : endLabel}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export { EdgeSwipeHint };
