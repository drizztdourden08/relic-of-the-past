/**
 * Maps equippedY slot ID (1-20) to sprite filename.
 */
const ITEM_SLOT_SPRITES: Record<number, string> = {
  1: 'hud-bow',
  2: 'hud-blue-boomerang',
  3: 'hud-hookshot',
  4: 'hud-bombs',
  5: 'hud-mushroom',
  6: 'hud-fire-rod',
  7: 'hud-ice-rod',
  8: 'hud-bombos',
  9: 'hud-ether',
  10: 'hud-quake',
  11: 'hud-lamp',
  12: 'hud-hammer',
  13: 'hud-shovel',
  14: 'hud-bug-net',
  15: 'hud-book-of-mudora',
  16: 'hud-bottle',
  17: 'hud-cane-of-somaria',
  18: 'hud-cane-of-byrna',
  19: 'hud-cape',
  20: 'hud-magic-mirror',
};

interface HudCurrentItemProps {
  itemId: number;
  scale: number;
  spritesBase: string;
}

/**
 * HudCurrentItem — the equipped item inside a bordered item box.
 * Renders the 8-tile frame (TL, Top, TR, Left, Right, BL, Bottom, BR)
 * with a black interior and the 16×16 item sprite centered inside.
 */
const HudCurrentItem = (props: HudCurrentItemProps) => {
  const { itemId, scale, spritesBase } = props;
  const tile = 8 * scale;

  // Item box is 4×4 tiles (32×32 SNES px): 1-tile border + 2×2 interior
  const boxSize = 4 * tile;

  const sprite = itemId > 0 ? ITEM_SLOT_SPRITES[itemId] : null;

  return (
    <div style={{
      position: 'relative',
      width: boxSize,
      height: boxSize,
      imageRendering: 'pixelated' as const,
    }}>
      {/* Black interior fill: inset 0.8 tiles from each edge of the 4×4 frame */}
      <div style={{
        position: 'absolute',
        left: tile * 0.8,
        top: tile * 0.8,
        width: boxSize - tile * 1.6,
        height: boxSize - tile * 1.6,
        background: 'black',
      }} />

      {/* Frame tiles */}
      {/* Top row: TL + Top + Top + TR */}
      <img src={`${spritesBase}hud-itembox-tl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-top.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-tr.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 3, top: 0, imageRendering: 'pixelated' }} />

      {/* Left column (rows 1-2) */}
      <img src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: tile, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-left.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: tile * 2, imageRendering: 'pixelated' }} />

      {/* Right column (rows 1-2) */}
      <img src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 3, top: tile, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-right.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 3, top: tile * 2, imageRendering: 'pixelated' }} />

      {/* Bottom row: BL + Bottom + Bottom + BR */}
      <img src={`${spritesBase}hud-itembox-bl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: tile * 3, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: tile * 3, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-bottom.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: tile * 3, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-itembox-br.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 3, top: tile * 3, imageRendering: 'pixelated' }} />

      {/* Item sprite centered in the 2×2 interior */}
      {sprite && (
        <img
          src={`${spritesBase}${sprite}.png`}
          width={tile * 2}
          height={tile * 2}
          draggable={false}
          style={{
            position: 'absolute',
            left: tile,
            top: tile,
            imageRendering: 'pixelated',
          }}
        />
      )}
    </div>
  );
};

export { HudCurrentItem, ITEM_SLOT_SPRITES };
export type { HudCurrentItemProps };
