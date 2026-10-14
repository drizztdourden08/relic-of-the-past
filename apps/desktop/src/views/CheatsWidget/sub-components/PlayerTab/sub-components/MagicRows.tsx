/* @layer renderer-widgets @kind component */
import { Box, Pressable } from '@drizztdourden08/tessera/primitives';
import { MAGIC_LEVELS } from '../PlayerTab.constants';
import { magicPercentOf } from '../behavior/magic-percent-of';
import { writeMagicLevel } from '../behavior/write-magic-level';
import type { MagicRowsProps } from '../PlayerTab.type';

const MagicRows = ({ inset, held, onHoverLevel }: MagicRowsProps) => {
  const rowsStyle = { inset, gridTemplateRows: `repeat(${MAGIC_LEVELS}, 1fr)` };

  return (
    <Box className="cheats-player__magic-rows" style={rowsStyle} onMouseLeave={() => onHoverLevel(null)}>
      {Array.from({ length: MAGIC_LEVELS }, (_, row) => {
        const level = MAGIC_LEVELS - row;
        return (
          <Pressable
            key={level}
            className="cheats-player__magic-row"
            data-held={level <= held ? '' : undefined}
            aria-label={`Magic ${magicPercentOf(level)}`}
            onMouseEnter={() => onHoverLevel(level)}
            onClick={() => writeMagicLevel(level)}
          />
        );
      })}
    </Box>
  );
};

export { MagicRows };
