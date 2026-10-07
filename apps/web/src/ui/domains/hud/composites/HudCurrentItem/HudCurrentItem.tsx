/* @layer renderer-hud @kind data */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { getSlotSprite } from '../PauseItemSlot';

interface HudCurrentItemProps {
  /** equippedY slot ID (1-20) */
  itemId: number;
  /** The equipped slot's inventory value (upgrade tier). See getSlotSprite. */
  itemValue: number;
  scale: number;
  spritesBase: string;
}

/**
 * The equipped item inside a bordered item box: the 8-tile frame (TL, Top, TR,
 * Left, Right, BL, Bottom, BR) with a black interior and the 16×16 item sprite centered.
 */
const HudCurrentItem = (props: HudCurrentItemProps) => {
  const { itemId, itemValue, scale, spritesBase } = props;
  const tile = 8 * scale;

  // Item box is 4×4 tiles (32×32 SNES px): 1-tile border + 2×2 interior
  const boxSize = 4 * tile;

  const sprite = itemId > 0 ? getSlotSprite(itemId - 1, itemValue) : null;

  return (
    <HudBox style={{
      position: 'relative',
      width: boxSize,
      height: boxSize,
      imageRendering: 'pixelated' as const,
    }}>
      {/* Black interior fill: inset 0.8 tiles from each edge of the 4×4 frame */}
      <HudBox style={{
        position: 'absolute',
        left: tile * 0.8,
        top: tile * 0.8,
        width: boxSize - tile * 1.6,
        height: boxSize - tile * 1.6,
        background: 'black',
      }} />

      {/* Frame tiles */}
      {/* Top row: TL + Top + Top + TR */}
      <HudImage src={`${spritesBase}hud-itembox-tl.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-tr.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: 0, imageRendering: 'pixelated' }} />

      {/* Left column (rows 1-2) */}
      <HudImage src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile * 2, imageRendering: 'pixelated' }} />

      {/* Right column (rows 1-2) */}
      <HudImage src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile * 2, imageRendering: 'pixelated' }} />

      {/* Bottom row: BL + Bottom + Bottom + BR */}
      <HudImage src={`${spritesBase}hud-itembox-bl.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: 0, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 2, top: tile * 3, imageRendering: 'pixelated' }} />
      <HudImage src={`${spritesBase}hud-itembox-br.png`} width={tile} height={tile}
        style={{ position: 'absolute', left: tile * 3, top: tile * 3, imageRendering: 'pixelated' }} />

      {/* Item sprite centered in the 2×2 interior */}
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
export type { HudCurrentItemProps };
