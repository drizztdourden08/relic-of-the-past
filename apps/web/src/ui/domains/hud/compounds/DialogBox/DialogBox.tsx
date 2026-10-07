/* @layer renderer-hud @kind component */
/**
 * The message box: a ground with an optional texture, the text, and a border on top. The border is
 * the game's own three tiles (corner, horizontal edge, vertical edge, the rest flipped), a drawn
 * single or double line with the chosen corners and corner marks, or nothing. When the tiles are
 * not extracted yet the original border falls back to a drawn single line. A feathered ground with no
 * border around it spreads a little past the box and fades out toward every edge.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { DialogCorner } from '@shared/game/dialog/box-style';
import { groundShape } from '@shared/game/dialog/frame-geometry';
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { DialogFrame } from '../../primitives/DialogFrame';
import { DialogTexture } from '../../primitives/DialogTexture';
import type { DialogBoxProps } from './DialogBox.type';

const groundFill = (color: string, opacity: number): string =>
  `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;

/** Solid in the middle, clear at both ends of one axis, over `fade` pixels. */
const edgeFade = (direction: string, fade: number): string =>
  `linear-gradient(${direction}, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`;

const featherStyle = (fade: number): CSSProperties => {
  const mask = `${edgeFade('to right', fade)}, ${edgeFade('to bottom', fade)}`;
  return { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' };
};

const DialogBox = (props: DialogBoxProps) => {
  const { rect, bordered, tile, spritesBase, ground, border, texture, feathered: wantsFeather, children } = props;
  const [tilesOk, setTilesOk] = useState(true);
  const corner = `${spritesBase}dialog-border-corner.png`;
  const hedge = `${spritesBase}dialog-border-hedge.png`;
  const vedge = `${spritesBase}dialog-border-vedge.png`;
  const useTiles = bordered && border.kind === 'original' && tilesOk;
  const drawn: 'single' | 'double' | null = bordered && !useTiles && border.kind !== 'none'
    ? (border.kind === 'double' ? 'double' : 'single')
    : null;

  const cornerStyle: CSSProperties = { position: 'absolute', width: tile, height: tile, imageRendering: 'pixelated' };
  const edgeStyle: CSSProperties = { position: 'absolute', imageRendering: 'pixelated', backgroundSize: `${tile}px ${tile}px` };
  const feathered = wantsFeather && !useTiles && !drawn;
  // A feathered ground reaches a tile past the box and fades over two, so the words sit on near full shade.
  const inset = useTiles ? Math.round(tile / 2) : (feathered ? -tile : 0);
  const groundCorner: DialogCorner = useTiles ? 'square' : (bordered ? border.corner : 'rounded');
  const shape = feathered ? featherStyle(2 * tile) : groundShape(groundCorner, bordered ? tile : Math.round(tile / 2));
  const groundW = rect.w - 2 * inset;
  const groundH = rect.h - 2 * inset;

  return (
    <HudBox style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      <HudBox style={{ position: 'absolute', inset, overflow: 'hidden', background: groundFill(ground.color, ground.opacity), ...shape }}>
        {texture.texture !== 'none' && (
          <DialogTexture
            width={groundW} height={groundH} unit={tile / 8}
            texture={texture.texture} color={texture.color} opacity={texture.opacity}
            animation={texture.animation} speed={texture.speed}
            scale={texture.scale} density={texture.density} scatter={texture.scatter}
          />
        )}
      </HudBox>
      {children}
      {drawn && (
        <DialogFrame
          width={rect.w} height={rect.h} tile={tile} border={drawn}
          thickness={border.thickness} color={border.color} corner={border.corner} mark={border.mark} markAngle={border.markAngle}
        />
      )}
      {useTiles && (
        <HudBox style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <HudImage src={corner} onError={() => setTilesOk(false)} style={{ ...cornerStyle, top: 0, left: 0 }} />
          <HudImage src={corner} style={{ ...cornerStyle, top: 0, right: 0, transform: 'scaleX(-1)' }} />
          <HudImage src={corner} style={{ ...cornerStyle, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
          <HudImage src={corner} style={{ ...cornerStyle, bottom: 0, right: 0, transform: 'scale(-1,-1)' }} />
          <HudBox style={{ ...edgeStyle, top: 0, left: tile, width: rect.w - 2 * tile, height: tile, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x' }} />
          <HudBox style={{ ...edgeStyle, bottom: 0, left: tile, width: rect.w - 2 * tile, height: tile, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x', transform: 'scaleY(-1)' }} />
          <HudBox style={{ ...edgeStyle, top: tile, left: 0, width: tile, height: rect.h - 2 * tile, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y' }} />
          <HudBox style={{ ...edgeStyle, top: tile, right: 0, width: tile, height: rect.h - 2 * tile, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y', transform: 'scaleX(-1)' }} />
        </HudBox>
      )}
    </HudBox>
  );
};

export { DialogBox };
