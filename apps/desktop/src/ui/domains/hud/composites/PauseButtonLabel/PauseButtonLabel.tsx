/* @layer renderer-hud @kind component */
/**
 * PauseButtonLabel — Y/X button indicator with label text.
 * Shows the button letter sprite in its associated color.
 */
import { HudImage } from '../../primitives/HudImage';

interface PauseButtonLabelProps {
  button: 'y' | 'x' | 'a';
  scale: number;
  spritesBase: string;
}

const PauseButtonLabel = ({ button, scale, spritesBase }: PauseButtonLabelProps) => {
  const tile = 8 * scale;
  const src = `${spritesBase}pause-btn-${button}.png`;

  // Button sprites are vertical strips: 8px wide × 16px tall (2 tiles)
  return (
    <HudImage
      src={src}
      width={tile}
      height={tile * 2}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseButtonLabel };
export type { PauseButtonLabelProps };
