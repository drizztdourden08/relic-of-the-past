/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import { outlineFilter } from '../../../primitives/HudSprite';
import { MAGIC_GREEN, MAGIC_WHITE } from '../HudMagicMeter.constants';
import type { MagicAccurateProps } from '../HudMagicMeter.type';

const MagicAccurate = (props: MagicAccurateProps) => {
  const { tile, scale, spritesBase, value } = props;

  const inset = tile * 0.8;
  const interiorW = tile * 3 - inset * 2;
  const interiorH = tile * 6 - inset * 2;
  const fillFraction = Math.min(Math.max(value / 128, 0), 1);
  const fillH = fillFraction * interiorH;
  const whiteInset = 2 * scale;

  return (
    <>
      <HudBox style={{ position: 'absolute', inset: 0, zIndex: 2, filter: outlineFilter(scale) }}>
        <HudImage src={`${spritesBase}hud-magic-tl.png`} width={tile} height={tile} atOrigin pixelated />
        <HudImage src={`${spritesBase}hud-magic-top.png`} width={tile} height={tile}
          style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
        <HudImage src={`${spritesBase}hud-magic-tr.png`} width={tile} height={tile}
          style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <HudBox key={i}>
            <HudImage src={`${spritesBase}hud-magic-left.png`} width={tile} height={tile}
              style={{ position: 'absolute', left: 0, top: tile * (i + 1), imageRendering: 'pixelated' }} />
            <HudImage src={`${spritesBase}hud-magic-right.png`} width={tile} height={tile}
              style={{ position: 'absolute', left: tile * 2, top: tile * (i + 1), imageRendering: 'pixelated' }} />
          </HudBox>
        ))}
        <HudImage src={`${spritesBase}hud-magic-bl.png`} width={tile} height={tile}
          style={{ position: 'absolute', left: 0, top: tile * 5, imageRendering: 'pixelated' }} />
        <HudImage src={`${spritesBase}hud-magic-bottom.png`} width={tile} height={tile}
          style={{ position: 'absolute', left: tile, top: tile * 5, imageRendering: 'pixelated' }} />
        <HudImage src={`${spritesBase}hud-magic-br.png`} width={tile} height={tile}
          style={{ position: 'absolute', left: tile * 2, top: tile * 5, imageRendering: 'pixelated' }} />
      </HudBox>

      {fillFraction > 0 && (
        <HudBox style={{
          position: 'absolute',
          left: inset,
          bottom: inset,
          width: interiorW,
          height: fillH,
          backgroundColor: MAGIC_GREEN,
          zIndex: 1,
        }}>
          {fillFraction < 1 && (
            <HudBox style={{
              position: 'absolute',
              left: whiteInset,
              top: 0,
              width: interiorW - whiteInset * 2,
              height: scale,
              backgroundColor: MAGIC_WHITE,
            }} />
          )}
        </HudBox>
      )}
    </>
  );
};

export { MagicAccurate };
