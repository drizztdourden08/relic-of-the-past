/* @layer shared-game @kind logic */
/** Convert Link's world-pixel position to his flood-fill start tile on a 64×64 screen grid. */

interface LinkStartTileArgs {
  linkX: number;
  linkY: number;
  screenWorldX: number;
  screenWorldY: number;
}

/**
 * Nearest tile of the player's 16x16 collision hitbox (the lower half of the sprite,
 * with the head skipped and the hitbox starting 8px below the sprite top), matching
 * the overlay debug footprint.
 */
const linkStartTile = ({ linkX, linkY, screenWorldX, screenWorldY }: LinkStartTileArgs): { row: number; col: number } => {
  const relPixelX = linkX - screenWorldX;
  const relPixelY = (linkY + 8) - screenWorldY;

  const tileMinCol = Math.floor(relPixelX / 8);
  const tileMaxCol = Math.floor((relPixelX + 15) / 8);
  const tileMinRow = Math.floor(relPixelY / 8);
  const tileMaxRow = Math.floor((relPixelY + 15) / 8);

  const centerCol = relPixelX / 8 + 0.5;
  const centerRow = relPixelY / 8 + 0.5;
  const clamp = (v: number) => Math.max(0, Math.min(63, v));

  let best: { row: number; col: number } | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (let r = tileMinRow; r <= tileMaxRow; r++) {
    for (let c = tileMinCol; c <= tileMaxCol; c++) {
      const rr = clamp(r);
      const cc = clamp(c);
      const dr = rr - centerRow;
      const dc = cc - centerCol;
      const d2 = dr * dr + dc * dc;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { row: rr, col: cc };
      }
    }
  }
  return best ?? { row: clamp(Math.floor(centerRow)), col: clamp(Math.floor(centerCol)) };
};

export { linkStartTile };
