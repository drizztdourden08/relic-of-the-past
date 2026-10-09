/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import { HEART_TILE } from '../../../primitives/HudHeart';
import type { LifeCaptionProps } from '../HudLife.type';

const LifeCaption = (props: LifeCaptionProps) => {
  const { scale, spritesBase } = props;
  const tile = HEART_TILE * scale;
  const shadow = scale;
  const sides = `drop-shadow(0 ${shadow}px 0 black) drop-shadow(${-shadow}px 0 0 black) drop-shadow(${shadow}px 0 0 black)`;

  return (
    <HudBox style={{ display: 'flex', justifyContent: 'center', height: tile + shadow }}>
      <HudImage src={`${spritesBase}hud-life-dash-left.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: sides }} />
      <HudImage src={`${spritesBase}hud-life-text.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: `drop-shadow(${shadow}px 0 0 black) drop-shadow(0 ${shadow}px 0 black)` }} />
      <HudImage src={`${spritesBase}hud-life-dash-right.png`} height={tile}
        style={{ imageRendering: 'pixelated', filter: sides }} />
    </HudBox>
  );
};

export { LifeCaption };
