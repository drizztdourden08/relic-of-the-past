/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, ColorSwatch } from '@drizztdourden08/tessera/primitives';
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@rotp/game-data';
import { bgr555ToHex } from '@rotp/game-core';
import type { OutfitSwatchGridProps } from '../PlayerSpriteStudio.type';
import { colorAt } from '../behavior/color-at';

const OutfitSwatchGrid = (props: OutfitSwatchGridProps) => {
  const t = useT();
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
          title={i + 1 === GLOVES_INDEX ? t('views-player-sprite-studio:outfit.indexGloves', { index: i + 1 }) : t('views-player-sprite-studio:outfit.index', { index: i + 1 })}
          onClick={(e) => onOpen(e.currentTarget, i)}
        />
      ))}
    </Box>
  );
};

export { OutfitSwatchGrid };
