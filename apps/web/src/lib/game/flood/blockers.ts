/* @layer bridge-wasm @kind logic */
/**
 * Solid-sprite blockers: the sprites that stop the BFS (tutorial guards 0x3F, barriers
 * 0x40, the uncle 0x73). Each stamps a 3x3 footprint so it seals a narrow passage
 * without a diagonal gap. The addressable spawn table is the general source; live
 * reads only describe the loaded screen and refine it. The uncle vanishes once his
 * check is collected, and indoors he must be stamped into EVERY layer (the raw grid
 * aliases layer 0, so a dual-layer room floods through him on layer 1).
 */
import { wasmGetIndoorUncleBlockers, wasmGetOverworldSpriteSpawns, wasmGetRoomSpriteSpawns, wasmGetViewportInfo, wasmGetAreaHeads, wasmGetLiveSprites } from '../';
import { resolveAreaSprite } from '../simulator/overworld-area';
import { getCompletedChecks } from '../tracker';
import { npcCheckFor } from './annotate/npc-checks';
import type { GridPos } from '@shared/game/navigation';
import { GRID_SIZE } from '@shared/game/navigation/types';
import { originContaining, overworldOrigin, tileInScreen } from './world-origin';

/** Sprite types that block the BFS. Everything else is walked through.
 *
 *  0x57 is the pair of statues flanking the sealed door in the south-west desert.
 *  The ground under them reads as plain floor, so without them a sealed dungeon
 *  reads as open. Their removal (altar use, needs a later item) is NOT modelled
 *  yet, so they block for the whole run; revisit when the altar trigger exists.
 *
 *  The castle-soldier family (0x41-0x4B) is deliberately NOT here: they patrol,
 *  so stamping a 3x3 block at a spawn they have left sealed both southern
 *  castle quadrants down to a quarter of their walkable area. A guard that
 *  blocks is a STATIONARY one (0x3F, health 255); see the live-sprite pass in
 *  `overworldBlockerCells`. */
const BLOCKER_SPRITES = new Set([0x3f, 0x40, 0x73, 0x57]);
const UNCLE_SPRITE = 0x73;
/** The room his check lives in. Sprite 0x73 spawns in two rooms and only one is a check. */
const UNCLE_CHECK_ROOM = 0x55;

/**
 * Has his check been collected? Asked by SPRITE ID, never by name: the check table owns
 * the name. `npcCheckFor` is the same matcher the simulator triggers through.
 */
const uncleCollected = (): boolean =>
  npcCheckFor(UNCLE_SPRITE, UNCLE_CHECK_ROOM, getCompletedChecks())?.done === true;

/** Every in-bounds tile of the 3×3 footprint centred on (row, col). */
const footprint = (row: number, col: number): GridPos[] => {
  const cells: GridPos[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) cells.push({ row: r, col: c });
    }
  }
  return cells;
};

/**
 * Blocker tiles for an overworld screen, from the progress-aware spawn table so remote
 * screens work too. Collected-uncle screens drop his footprint. A multi-screen area
 * returns the WHOLE area's spawns measured from its head screen, so each spawn is
 * resolved to the screen it stands on; clipping instead silently drops blockers.
 */
const overworldBlockerCells = (screenIndex: number): GridPos[] => {
  const skipUncle = uncleCollected();
  const heads = wasmGetAreaHeads();
  const cells: GridPos[] = [];
  for (const raw of wasmGetOverworldSpriteSpawns(screenIndex) ?? []) {
    if (!BLOCKER_SPRITES.has(raw.spriteType)) continue;
    if (raw.spriteType === UNCLE_SPRITE && skipUncle) continue;
    const resolved = heads
      ? resolveAreaSprite(screenIndex, { row: raw.row, col: raw.col }, heads)
      : { screenIndex, tile: { row: raw.row, col: raw.col } };
    if (resolved.screenIndex !== screenIndex) continue;
    const s = { spriteType: raw.spriteType, row: resolved.tile.row, col: resolved.tile.col };
    cells.push(...footprint(s.row, s.col));
  }

  // The occupied screen ALSO reads live sprite positions: the spawn table only says
  // where a sprite STARTED, and a patrolling guard blocks where it stands now (same
  // fix stampIndoorBlockers applies to the uncle). Additive, not a replacement, so a
  // stationary guard is stamped twice (harmless) and the other sub-screens of a big
  // area keep their coverage.
  const vp = wasmGetViewportInfo();
  if (vp) {
    const screenOrigin = overworldOrigin(screenIndex);
    const liveOrigin = originContaining(vp.linkX, vp.linkY);
    if (liveOrigin.x === screenOrigin.x && liveOrigin.y === screenOrigin.y) {
      for (const s of wasmGetLiveSprites()) {
        if (!BLOCKER_SPRITES.has(s.type)) continue;
        if (s.type === UNCLE_SPRITE && skipUncle) continue;
        const spriteOrigin = originContaining(s.x, s.y);
        if (spriteOrigin.x !== screenOrigin.x || spriteOrigin.y !== screenOrigin.y) continue;
        const t = tileInScreen(s.x, s.y, screenOrigin);
        cells.push(...footprint(t.row, t.col));
      }
    }
  }
  return cells;
};

/** Stamp the uncle's footprint as wall into every supplied grid. The loaded room uses his LIVE position (he walks); other rooms use his spawn. */
const stampIndoorBlockers = (roomId: number, grids: number[][][], isLiveRoom: boolean): void => {
  if (uncleCollected()) return;
  const cells: GridPos[] = [];
  const vp = isLiveRoom ? wasmGetViewportInfo() : null;
  if (vp) {
    const origin = originContaining(vp.linkX, vp.linkY);
    for (const b of wasmGetIndoorUncleBlockers()) {
      const t = tileInScreen(b.x, b.y, origin);
      cells.push(...footprint(t.row, t.col));
    }
  } else {
    for (const s of wasmGetRoomSpriteSpawns(roomId) ?? []) {
      if (s.spriteType === UNCLE_SPRITE) cells.push(...footprint(s.row, s.col));
    }
  }
  for (const grid of grids) {
    for (const { row, col } of cells) grid[row][col] = 0x01; // wall/blocked
  }
};

export { overworldBlockerCells, stampIndoorBlockers, BLOCKER_SPRITES };
