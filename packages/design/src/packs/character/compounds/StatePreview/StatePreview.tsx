/* @layer renderer-components @kind component */
import { Box, Text, Status } from '@drizztdourden08/tessera/primitives';
import { PoseCanvas } from '../PoseCanvas';
import { facingsOf, framesOf, FACING_LABELS, labelFor } from '@rotp/game-data';
import type { StatePreviewProps } from './StatePreview.type';
import './StatePreview.css';

const StatePreview = (props: StatePreviewProps) => {
  const { sheet, row, state, tick, scale } = props;
  const meta = labelFor(state.action);
  const facings = facingsOf(state);

  return (
    <Box className="state-preview">
      <Box className="state-preview__head">
        <Text className="state-preview__title">{meta.label}</Text>
        <Status tone="neutral">action 0x{state.action.toString(16).padStart(2, '0')}</Status>
        {!state.perFacing && <Status tone="neutral">no facing variation</Status>}
        <Text className="state-preview__from">{meta.from}</Text>
      </Box>
      <Box className="state-preview__row">
        {facings.map((facing) => (
          <Box key={facing} className="state-preview__cell">
            <PoseCanvas sheet={sheet} row={row} state={state} facing={facing} tick={tick} scale={scale} />
            <Text className="state-preview__label">
              {state.perFacing ? FACING_LABELS[facing] : 'All facings'}
              <Text as="span" className="state-preview__count">{framesOf(state, facing).length} fr</Text>
            </Text>
          </Box>
        ))}
      </Box>
      <Text className="state-preview__note">
        Body only. The blade, shield and held items are drawn from other graphics the engine
        stages separately, so no sprite sheet can supply them.
      </Text>
    </Box>
  );
};

export { StatePreview };
