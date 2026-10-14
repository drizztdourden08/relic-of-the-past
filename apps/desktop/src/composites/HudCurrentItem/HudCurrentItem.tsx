/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { getSlotSprite } from '../PauseItemSlot';
import type { HudCurrentItemProps } from './HudCurrentItem.type';

const HudCurrentItem = (props: HudCurrentItemProps) => {
  const { itemId, itemValue, scale, spritesBase } = props;
  const tile = 8 * scale;

  const boxSize = 4 * tile;

  const sprite = itemId > 0 ? getSlotSprite(itemId - 1, itemValue) : null;

  return (
    <HudBox style={{
      position: 'relative',
      width: boxSize,
      height: boxSize,
      imageRendering: 'pixelated' as const,
    }}>
      <HudBox style={{
        position: 'absolute',
        left: tile * 0.8,
        top: tile * 0.8,
        width: boxSize - tile * 1.6,
        height: boxSize - tile * 1.6,
        background: 'black',
      }} />

      <HudImage src={`${spritesBase}hud-itembox-tl.png`} width={tile} height={tile} atOrigin pixelated />
      <HudImage src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-tr.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: 0, imageRendering: 'pixelated' }} />

      <HudImage src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile * 2, imageRendering: 'pixelated' }} />

      <HudImage src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile * 2, imageRendering: 'pixelated' }} />

      <HudImage src={`${spritesBase}hud-itembox-bl.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-br.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile * 3, imageRendering: 'pixelated' }} />

      {sprite && (
        <HudImage
          src={`${spritesBase}${sprite}.png`}
          width={tile * 2}
          height={tile * 2}
          style={{
            position: 'absolute',
            left: tile,
            top: tile,
            imageRendering: 'pixelated',
          }}
        />
      )}
    </HudBox>
  );
};

export { HudCurrentItem };
