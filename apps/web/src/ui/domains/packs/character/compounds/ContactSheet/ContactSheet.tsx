/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PoseCanvas } from '../PoseCanvas';
import { POSE_ATLAS, poseCanvasSize } from '@shared/game/data/native-tables/player-pose-atlas';
import { labelFor } from '@shared/game/data/native-tables/player-state-labels';
import type { ContactSheetProps } from './ContactSheet.type';
import './ContactSheet.css';

const { width: POSE_WIDTH } = poseCanvasSize();

const ContactSheet = (props: ContactSheetProps) => {
  const { sheet, row, tick, scale, onSelect } = props;

  const cellMinStyle = { '--contact-sheet-cell-min': `${POSE_WIDTH * scale}px` } as React.CSSProperties;

  return (
    <Box className="contact-sheet" style={cellMinStyle}>
      {POSE_ATLAS.states.map((state) => (
        <Box
          key={state.action}
          className="contact-sheet__cell"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(state.action)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(state.action); }}
        >
          <PoseCanvas sheet={sheet} row={row} state={state} facing={1} tick={tick} scale={scale} />
          <Text className="contact-sheet__label">{labelFor(state.action).label}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { ContactSheet };
