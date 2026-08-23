/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Badge } from '@ds/primitives/Badge';
import { PoseCanvas } from './PoseCanvas';
import { facingsOf, framesOf, FACING_LABELS } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import { labelFor } from '@shared/game/data/native-tables/player-state-labels';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface StatePreviewProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  tick: number;
  scale: number;
}

/** One state, every facing it distinguishes, each looping on the shared clock. */
const StatePreview = (props: StatePreviewProps) => {
  const { sheet, row, state, tick, scale } = props;
  const meta = labelFor(state.action);
  const facings = facingsOf(state);

  return (
    <Box className="state-preview">
      <Box className="state-preview__head">
        <Text className="state-preview__title">{meta.label}</Text>
        <Badge variant="neutral">action 0x{state.action.toString(16).padStart(2, '0')}</Badge>
        {!state.perFacing && <Badge variant="neutral">no facing variation</Badge>}
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
        Body only — the blade, shield and held items are drawn from other graphics the engine
        stages separately, so no sprite sheet can supply them.
      </Text>
    </Box>
  );
};

export { StatePreview };
export type { StatePreviewProps };
