/* @layer renderer-hud @kind component */
import { HudImage } from '../../primitives/HudImage';
import type { PausePendantIconProps } from './PausePendantIcon.type';

const PausePendantIcon = ({ variant, scale, spritesBase }: PausePendantIconProps) => {
  const size = 16 * scale;
  const src = `${spritesBase}pause-pendant-${variant}.png`;

  return (
    <HudImage
      src={src}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PausePendantIcon };
