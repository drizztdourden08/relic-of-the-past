/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudNumber } from '../../primitives/HudNumber';
import { HudSprite } from '../../primitives/HudSprite';

interface HudCountProps {
  /** Icon sprite filename (without extension) */
  icon: string;
  /** Icon width in SNES pixels (8 for single-tile, 16 for double) */
  iconWidth?: number;
  value: number;
  digits?: number;
  scale: number;
  spritesBase: string;
}

/**
 * HudCount — vertical flex stack: icon on top, digits below.
 * Fully flex-driven — no absolute positioning.
 */
const HudCount = (props: HudCountProps) => {
  const { icon, iconWidth = 8, value, digits = 2, scale, spritesBase } = props;

  const iconW = iconWidth * scale;
  const iconH = 8 * scale;

  return (
    <HudBox style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <HudSprite
        src={`${spritesBase}${icon}.png`}
        width={iconW}
        height={iconH}
        outline
        scale={scale}
      />
      <HudNumber value={value} digits={digits} scale={scale} spritesBase={spritesBase} />
    </HudBox>
  );
};

export { HudCount };
export type { HudCountProps };
