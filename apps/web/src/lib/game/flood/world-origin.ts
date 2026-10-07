/* @layer bridge-wasm @kind logic */
/**
 * Screen/room world-pixel origins. Both formulas were re-derived in eight places
 * and disagreed in one: within a single widget run the grid origin came from
 * the player's live position while the entrance origin came from the screen index, so
 * they only matched while the game stood in the screen being flooded. Deriving
 * both from the index makes them agree for remote screens too.
 */
const SCREEN_PX = 512;

/** Overworld screen index → its top-left world pixel (8 screens per row). */
const overworldOrigin = (screenIndex: number): { x: number; y: number } => ({
  x: (screenIndex & 7) * SCREEN_PX,
  y: ((screenIndex >> 3) & 7) * SCREEN_PX,
});

/** Indoor room id → its top-left world pixel (16 rooms per row). */
const roomOrigin = (roomId: number): { x: number; y: number } => ({
  x: (roomId % 16) * SCREEN_PX,
  y: Math.floor(roomId / 16) * SCREEN_PX,
});

/** World pixel → the origin of the 512×512 screen containing it. */
const originContaining = (x: number, y: number): { x: number; y: number } => ({
  x: Math.floor(x / SCREEN_PX) * SCREEN_PX,
  y: Math.floor(y / SCREEN_PX) * SCREEN_PX,
});

/** World pixel → 8px tile coords relative to the given origin. */
const tileInScreen = (x: number, y: number, origin: { x: number; y: number }): { row: number; col: number } => ({
  row: Math.floor((y - origin.y) / 8),
  col: Math.floor((x - origin.x) / 8),
});

/**
 * The tile the player actually stands on for an entrance/fall-hole spawn. A spawn
 * records his sprite's TOP-LEFT, so the tile under his feet is one column right
 * and two rows down (his hitbox is the bottom 2×2 of the 16×24 sprite). The
 * widget applied this offset and the dumper did not, so the same fall hole was
 * reported on two different tiles.
 */
const spawnLandingTile = (x: number, y: number, origin: { x: number; y: number }): { row: number; col: number } => {
  const t = tileInScreen(x, y, origin);
  return { row: t.row + 2, col: t.col + 1 };
};

/**
 * The origin of the screen a consumer is looking at. The ONE place that decides
 * "indoors, use the page the player stands on; outdoors, use the screen index".
 *
 * Five call sites re-derived this ternary inline (the dumper, the sim-run flag,
 * the observation builder, the overlay draw context and the tile inspector). They
 * agreed, but each copy is a chance to drift, and a drifted origin silently draws
 * every marker on the wrong screen.
 */
const screenOriginFor = (
  args: { isIndoors: boolean; linkX: number; linkY: number; screenIndex: number },
): { x: number; y: number } => {
  const { isIndoors, linkX, linkY, screenIndex } = args;
  return isIndoors ? originContaining(linkX, linkY) : overworldOrigin(screenIndex);
};

export { originContaining, overworldOrigin, roomOrigin, screenOriginFor, spawnLandingTile, tileInScreen, SCREEN_PX };
