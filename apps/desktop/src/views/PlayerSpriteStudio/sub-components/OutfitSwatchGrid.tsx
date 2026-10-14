/* @layer renderer-components @kind component */
import { Box, ColorSwatch } from '@drizztdourden08/tessera/primitives';
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@rotp/game-data';
import { bgr555ToHex } from '@rotp/game-core';
import type { OutfitSwatchGridProps } from '../PlayerSpriteStudio.type';
import { colorAt } from '../behavior/color-at';

const OutfitSwatchGrid = (props: OutfitSwatchGridProps) => {
  const { colors, originals, slot, onOpen } = props;

  return (
    <Box className="palette-editor__grid">
      {Array.from({ length: COLORS_PER_OUTFIT }, (_, i) => (
        <ColorSwatch
          key={i}
          color={bgr555ToHex(colorAt(colors, i))}
          caption={i + 1}
          selected={slot === i}
          edited={colors[i] !== originals[i]}
          title={`Index ${i + 1}${i + 1 === GLOVES_INDEX ? ' (replaced by the glove colour when gloves are worn)' : ''}`}
          onClick={(e) => onOpen(e.currentTarget, i)}
        />
      ))}
    </Box>
  );
};

export { OutfitSwatchGrid };
