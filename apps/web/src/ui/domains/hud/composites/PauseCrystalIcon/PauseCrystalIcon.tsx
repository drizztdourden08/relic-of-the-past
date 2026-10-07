/* @layer renderer-hud @kind component */
/**
 * Renders a single crystal, empty or filled.
 * A crystal is 16×8: two tiles side by side, one tile tall. Drawing it square
 * stretches the sprite to double height.
 */
import { HudImage } from '../../primitives/HudImage';

interface PauseCrystalIconProps {
  filled: boolean;
  scale: number;
  spritesBase: string;
}

const PauseCrystalIcon = ({ filled, scale, spritesBase }: PauseCrystalIconProps) => {
  const width = 16 * scale;
  const height = 8 * scale;
  const src = `${spritesBase}pause-crystal-${filled ? 'filled' : 'empty'}.png`;

  return (
    <HudImage
      src={src}
      width={width}
      height={height}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseCrystalIcon };
export type { PauseCrystalIconProps };
