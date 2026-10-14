/* @layer renderer-hud @kind component */
import { useState } from 'react';
import { HudBox } from '../../primitives/HudBox';
import { DialogFrame } from '../../primitives/DialogFrame';
import { DialogTexture } from '../../primitives/DialogTexture';
import { dialogLook } from './behavior/dialog-look';
import { groundFill } from './behavior/ground-fill';
import type { DialogBoxProps } from './DialogBox.type';
import { BorderTiles } from './sub-components/BorderTiles';

const DialogBox = (props: DialogBoxProps) => {
  const { rect, bordered, tile, spritesBase, ground, border, texture, feathered: wantsFeather, children } = props;
  const [tilesOk, setTilesOk] = useState(true);
  const { useTiles, drawn, inset, shape } = dialogLook({ bordered, border, tile, wantsFeather, tilesOk });
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
        <BorderTiles rect={rect} tile={tile} spritesBase={spritesBase} onFail={() => setTilesOk(false)} />
      )}
    </HudBox>
  );
};

export { DialogBox };
