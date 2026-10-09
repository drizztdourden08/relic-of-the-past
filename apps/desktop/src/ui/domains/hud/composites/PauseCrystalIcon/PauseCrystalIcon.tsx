/* @layer renderer-hud @kind component */
import { HudImage } from '../../primitives/HudImage';
import type { PauseCrystalIconProps } from './PauseCrystalIcon.type';

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
