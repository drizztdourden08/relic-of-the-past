/* @layer renderer-hud @kind component */
/**
 * PauseCrystalIcon — renders a single crystal (empty or filled).
 * Crystals are 16×16 (2×2 tiles).
 */
import { HudImage } from '../../primitives/HudImage';

interface PauseCrystalIconProps {
  filled: boolean;
  scale: number;
  spritesBase: string;
}

const PauseCrystalIcon = ({ filled, scale, spritesBase }: PauseCrystalIconProps) => {
  const size = 16 * scale;
  const src = `${spritesBase}pause-crystal-${filled ? 'filled' : 'empty'}.png`;

  return (
    <HudImage
      src={src}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseCrystalIcon };
export type { PauseCrystalIconProps };
