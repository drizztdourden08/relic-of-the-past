/* @layer renderer-components @kind component */
import { Box, Text, Status } from '@drizztdourden08/tessera/primitives';
import { PoseCanvas } from '../PoseCanvas';
import { facingsOf, framesOf, labelFor } from '@rotp/game-data';
import { poseLabelsOf } from '../../behavior/pose-labels';
import type { StatePreviewProps } from './StatePreview.type';
import './StatePreview.css';

const StatePreview = (props: StatePreviewProps) => {
  const { sheet, row, state, tick, scale, labels } = props;
  const text = poseLabelsOf(labels);
  const meta = labelFor(state.action);
  const facings = facingsOf(state);

  return (
    <Box className="state-preview">
      <Box className="state-preview__head">
        <Text className="state-preview__title">{text.stateName(state.action)}</Text>
        <Status tone="neutral">{text.actionId(state.action.toString(16).padStart(2, '0'))}</Status>
        {!state.perFacing && <Status tone="neutral">{text.noFacingVariation}</Status>}
        <Text className="state-preview__from">{meta.from}</Text>
      </Box>
      <Box className="state-preview__row">
        {facings.map((facing) => (
          <Box key={facing} className="state-preview__cell">
            <PoseCanvas sheet={sheet} row={row} state={state} facing={facing} tick={tick} scale={scale} />
            <Text className="state-preview__label">
              {state.perFacing ? text.facingName(facing) : text.allFacings}
              <Text as="span" className="state-preview__count">{text.frameCount(framesOf(state, facing).length)}</Text>
            </Text>
          </Box>
        ))}
      </Box>
      <Text className="state-preview__note">{text.bodyOnly}</Text>
    </Box>
  );
};

export { StatePreview };
