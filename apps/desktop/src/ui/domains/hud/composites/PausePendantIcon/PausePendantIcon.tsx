/* @layer renderer-hud @kind component */
/**
 * PausePendantIcon — renders a single pendant (empty or colored).
 * Pendants are 16×16 (2×2 tiles).
 */
import { HudImage } from '../../primitives/HudImage';

interface PausePendantIconProps {
  variant: 'empty' | 'green' | 'blue' | 'red';
  scale: number;
  spritesBase: string;
}

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
export type { PausePendantIconProps };
