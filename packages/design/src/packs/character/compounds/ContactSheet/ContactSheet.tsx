/* @layer renderer-components @kind component */
import { Grid, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { PoseCanvas } from '../PoseCanvas';
import { POSE_ATLAS, poseCanvasSize, labelFor } from '@rotp/game-data';
import { CELL_MIN_PX } from './ContactSheet.constants';
import type { ContactSheetProps } from './ContactSheet.type';
import './ContactSheet.css';

const { width: POSE_WIDTH } = poseCanvasSize();

const ContactSheet = (props: ContactSheetProps) => {
  const { sheet, row, tick, scale, onSelect } = props;

  return (
    <Grid minColWidth={Math.max(CELL_MIN_PX, POSE_WIDTH * scale)} gap="sm">
      {POSE_ATLAS.states.map((state) => (
        <Pressable key={state.action} className="contact-sheet__cell" onClick={() => onSelect(state.action)}>
          <PoseCanvas sheet={sheet} row={row} state={state} facing={1} tick={tick} scale={scale} />
          <Text className="contact-sheet__label">{labelFor(state.action).label}</Text>
        </Pressable>
      ))}
    </Grid>
  );
};

export { ContactSheet };
