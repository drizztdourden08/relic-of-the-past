/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { PoseCanvas } from './PoseCanvas';
import { POSE_ATLAS } from '@shared/game/data/native-tables/player-pose-atlas';
import { labelFor } from '@shared/game/data/native-tables/player-state-labels';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface ContactSheetProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  tick: number;
  scale: number;
  onSelect: (action: number) => void;
}

/**
 * Every state at once, all animating. This is the view that answers "what did my recolour
 * do" — one clock drives all of them, so the cost is one palette resolve per change rather
 * than one per cell.
 */
const ContactSheet = (props: ContactSheetProps) => {
  const { sheet, row, tick, scale, onSelect } = props;

  return (
    <Box className="contact-sheet">
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
export type { ContactSheetProps };
