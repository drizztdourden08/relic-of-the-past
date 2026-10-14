/* @layer renderer-components @kind component */
import { Box, ColorSwatch } from '@drizztdourden08/tessera/primitives';
import { bgr555ToHex } from '@rotp/game-core';
import type { GloveSwatchGridProps } from '../PlayerSpriteStudio.type';
import { colorAt } from '../behavior/color-at';
import { gloveSlot } from '../behavior/glove-slot';

const GloveSwatchGrid = (props: GloveSwatchGridProps) => {
  const { gloves, originalGloves, slot, onOpen } = props;

  return (
    <Box className="palette-editor__grid">
      {(['g0', 'g1'] as const).map((id) => (
        <ColorSwatch
          key={id}
          color={bgr555ToHex(colorAt(gloves, gloveSlot(id)))}
          caption={id === 'g0' ? 'P' : 'T'}
          selected={slot === id}
          edited={colorAt(gloves, gloveSlot(id)) !== colorAt(originalGloves, gloveSlot(id))}
          title={id === 'g0' ? 'Power gloves' : 'Titan mitts'}
          onClick={(e) => onOpen(e.currentTarget, id)}
        />
      ))}
    </Box>
  );
};

export { GloveSwatchGrid };
