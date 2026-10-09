/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import { fillSprites } from '../behavior/fill-sprites';
import type { MagicOriginalProps } from '../HudMagicMeter.type';

const MagicOriginal = (props: MagicOriginalProps) => {
  const { tile, spritesBase, fillLevel } = props;
  const fills = fillSprites(fillLevel);

  return (
    <>
      <HudImage src={`${spritesBase}hud-magic-tl.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-magic-top.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-magic-tr.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />

      {fills.map((fill, i) => (
        <HudBox key={i} style={{ position: 'absolute', left: 0, top: tile * (i + 1), width: tile * 3, height: tile }}>
          <HudImage src={`${spritesBase}hud-magic-left.png`} width={tile} height={tile}
            style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
          <HudImage src={`${spritesBase}${fill}.png`} width={tile} height={tile}
            style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
          <HudImage src={`${spritesBase}hud-magic-right.png`} width={tile} height={tile}
            style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
        </HudBox>
      ))}

      <HudImage src={`${spritesBase}hud-magic-bl.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile * 5, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-magic-bottom.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: tile * 5, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-magic-br.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: tile * 5, imageRendering: 'pixelated' }} />
    </>
  );
};

export { MagicOriginal };
