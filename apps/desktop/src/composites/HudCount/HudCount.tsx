/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudNumber } from '../../primitives/HudNumber';
import { HudSprite } from '../../primitives/HudSprite';
import type { HudCountProps } from './HudCount.type';

const HudCount = (props: HudCountProps) => {
  const { icon, iconWidth = 8, value, digits = 2, isMax = false, scale, spritesBase } = props;

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
      <HudNumber value={value} digits={digits} isMax={isMax} scale={scale} spritesBase={spritesBase} />
    </HudBox>
  );
};

export { HudCount };
