/* @layer bridge-wasm @kind logic */
/**
 * Solid-sprite blockers — the sprites that actually stop the BFS, as opposed to
 * the enemies it ignores: the tutorial guards (0x3F), barriers (0x40) and the
 * uncle (0x73). Each stamps a 3×3 footprint so it seals a narrow passage rather
 * than leaving a diagonal gap.
 *
 * This replaces three separate implementations that had drifted:
 *   - the widget read LIVE sprites and required `e === 0` for the uncle
 *   - the simulator read the ADDRESSABLE spawn table and dropped that condition
 *   - a third copy sat unused in shared/game/navigation/session/
 * Live reads only describe the loaded screen, so the addressable table is the
 * general source and the live one is a refinement for the screen the player occupies.
 *
 * The uncle is special twice over: he vanishes once his check is collected, and
 * indoors he must be stamped into EVERY layer. The widget stamped only the raw
 * grid — which aliases layer 0 — so a dual-layer room floods straight through
 * him on layer 1.
 */
import { wasmGetIndoorUncleBlockers, wasmGetOverworldSpriteSpawns, wasmGetRoomSpriteSpawns, wasmGetViewportInfo, wasmGetAreaHeads } from '../';
import { resolveAreaSprite } from '../simulator/overworld-area';
import { getCompletedChecks } from '../tracker';
import { npcCheckFor } from './annotate/npc-checks';
import type { GridPos } from '@shared/game/navigation';
import { GRID_SIZE } from '@shared/game/navigation/types';
import { originContaining, tileInScreen } from './world-origin';

/** Sprite types that block the BFS. Everything else is walked through.
 *
 *  0x57 is the pair of statues flanking the sealed door in the south-west
 *  desert. They are solid, and the ground they stand on reads as plain floor,
 *  so without them the flood walks between them and treats a sealed dungeon as
 *  open. They step aside only once the altar in front of them is used, which
 *  needs an item from a later dungeon — that removal is NOT modelled yet, so
 *  they block for the whole run. Correct for everything before the first
 *  dungeon; revisit when the altar trigger exists. */
const BLOCKER_SPRITES = new Set([0x3f, 0x40, 0x73, 0x57]);
const UNCLE_SPRITE = 0x73;
/** The room his check lives in — sprite 0x73 spawns in two, and only one is a check. */
const UNCLE_CHECK_ROOM = 0x55;

/**
 * Has his check been collected? Asked by SPRITE ID, never by name: the check
 * table owns the name, and code that repeats it silently stops agreeing with the
 * table the moment either side is edited (and a randomizer renames the item, not
 * the check). `npcCheckFor` is the same matcher the simulator triggers through.
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
 * Blocker tiles for an overworld screen, from the progress-aware spawn table so
 * remote screens work too. Collected-uncle screens drop his footprint.
 *
 * A multi-screen area hands back the WHOLE area's spawns with tiles measured
 * from its head screen, so a blocker on the far half carries a coordinate past
 * this screen's grid. Clipping those away silently drops the blocker and the
 * flood walks straight through it; each spawn is resolved to the screen it
 * really stands on and only kept when that is this one.
 */
const overworldBlockerCells = (screenIndex: number): GridPos[] => {
  const skipUncle = uncleCollected();
  const heads = wasmGetAreaHeads();
  const cells: GridPos[] = [];
  for (const raw of wasmGetOverworldSpriteSpawns(screenIndex)) {
    if (!BLOCKER_SPRITES.has(raw.spriteType)) continue;
    if (raw.spriteType === UNCLE_SPRITE && skipUncle) continue;
    const resolved = heads
      ? resolveAreaSprite(screenIndex, { row: raw.row, col: raw.col }, heads)
      : { screenIndex, tile: { row: raw.row, col: raw.col } };
    if (resolved.screenIndex !== screenIndex) continue;
    const s = { spriteType: raw.spriteType, row: resolved.tile.row, col: resolved.tile.col };
    cells.push(...footprint(s.row, s.col));
  }
  return cells;
};

/**
 * Stamp the uncle's footprint as wall into every supplied grid. The loaded room
 * uses his LIVE position (he walks); any other room uses his static spawn.
 */
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
    for (const s of wasmGetRoomSpriteSpawns(roomId)) {
      if (s.spriteType === UNCLE_SPRITE) cells.push(...footprint(s.row, s.col));
    }
  }
  for (const grid of grids) {
    for (const { row, col } of cells) grid[row][col] = 0x01; // wall/blocked
  }
};

export { overworldBlockerCells, stampIndoorBlockers, BLOCKER_SPRITES };
