/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import { fillSprites } from '../behavior/fill-sprites';
import { MagicCapRow } from './MagicCapRow';
import type { MagicOriginalProps } from '../HudMagicMeter.type';

const MagicOriginal = (props: MagicOriginalProps) => {
  const { tile, spritesBase, fillLevel } = props;
  const fills = fillSprites(fillLevel);

  return (
    <>
      <MagicCapRow edge="top" tile={tile} spritesBase={spritesBase} />

      {fills.map((fill, i) => (
        <HudBox key={i} style={{ position: 'absolute', left: 0, top: tile * (i + 1), width: tile * 3, height: tile }}>
          <HudImage src={`${spritesBase}hud-magic-left.png`} width={tile} height={tile} atOrigin pixelated />
          <HudImage src={`${spritesBase}${fill}.png`} width={tile} height={tile}
            style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
          <HudImage src={`${spritesBase}hud-magic-right.png`} width={tile} height={tile}
            style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
        </HudBox>
      ))}

      <MagicCapRow edge="bottom" tile={tile} spritesBase={spritesBase} />
    </>
  );
};

export { MagicOriginal };
