/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { HudBox } from '../../../primitives/HudBox';
import { HudImage } from '../../../primitives/HudImage';
import type { BorderTilesProps } from '../DialogBox.type';

const BorderTiles = ({ rect, tile, spritesBase, onFail }: BorderTilesProps) => {
  const corner = `${spritesBase}dialog-border-corner.png`;
  const hedge = `${spritesBase}dialog-border-hedge.png`;
  const vedge = `${spritesBase}dialog-border-vedge.png`;

  const cornerStyle: CSSProperties = { position: 'absolute', width: tile, height: tile, imageRendering: 'pixelated' };
  const edgeStyle: CSSProperties = { position: 'absolute', imageRendering: 'pixelated', backgroundSize: `${tile}px ${tile}px` };

  return (
    <HudBox layout="overlay">
      <HudImage src={corner} onError={onFail} style={{ ...cornerStyle, top: 0, left: 0 }} />
      <HudImage src={corner} style={{ ...cornerStyle, top: 0, right: 0, transform: 'scaleX(-1)' }} />
      <HudImage src={corner} style={{ ...cornerStyle, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
      <HudImage src={corner} style={{ ...cornerStyle, bottom: 0, right: 0, transform: 'scale(-1,-1)' }} />
      <HudBox style={{ ...edgeStyle, top: 0, left: tile, width: rect.w - 2 * tile, height: tile, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x' }} />
      <HudBox style={{ ...edgeStyle, bottom: 0, left: tile, width: rect.w - 2 * tile, height: tile, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x', transform: 'scaleY(-1)' }} />
      <HudBox style={{ ...edgeStyle, top: tile, left: 0, width: tile, height: rect.h - 2 * tile, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y' }} />
      <HudBox style={{ ...edgeStyle, top: tile, right: 0, width: tile, height: rect.h - 2 * tile, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y', transform: 'scaleX(-1)' }} />
    </HudBox>
  );
};

export { BorderTiles };
