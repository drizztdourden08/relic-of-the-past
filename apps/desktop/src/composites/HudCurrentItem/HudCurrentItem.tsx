/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { getSlotSprite } from '../PauseItemSlot';
import { ITEMBOX_CELLS } from './HudCurrentItem.constants';
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
      {ITEMBOX_CELLS.map(({ piece, col, row }) => (
        <HudImage
          key={`${col}:${row}`}
          src={`${spritesBase}hud-itembox-${piece}.png`}
          width={tile}
          height={tile}
          style={{ position: 'absolute', left: tile * col, top: tile * row, imageRendering: 'pixelated' }}
        />
      ))}

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
