/* @layer shared-game @kind logic */
/**
 * Decides which sprites gating the current room's clear can be killed with
 * the inventory on hand. A sprite gates the clear unless its flags4 carries
 * the room-clear-exempt bit (Sprite_CheckIfRoomIsClear, sprite.c). Damage
 * class 0 is a REAL class resolved through damageByClass like any other — a
 * weapon whose damage class happens to read 0 there is not automatically
 * harmless, and one whose class reads nonzero is not automatically lethal;
 * both are runtime lookups, never assumed.
 */
import type { GridPos } from '../../navigation/types';
import type { SimSprite, ScreenGridBundle, CombatContext, SpriteCombatInfo } from '../types';
import { weaponsFor } from './enemy-reach-weapons';
import { findPositionFor } from './enemy-reach-geometry';

/** Bit that exempts a sprite from gating the room's clear. */
const ROOM_CLEAR_EXEMPT_BIT = 0x40;

type ReachKind = 'contact' | 'travelling';

interface Weapon {
  ancillaType: number | null;
  damageClass: number;
  kind: ReachKind;
  travel: number;
  label: string;
}

interface EnemyReach {
  sprite: SimSprite;
  health: number;
  killable: boolean;
  by?: Weapon;
  from?: GridPos;
  blockedBy?: 'no-weapon' | 'no-line' | 'gated-off';
}

interface RoomThreat {
  gating: EnemyReach[];
  clearable: boolean;
}

/** How far from a sprite a reached tile may sit and still count it as standing on
 *  ground the player currently occupies. Two tiles covers a sprite whose recorded
 *  tile sits just inside the wall its floor abuts. */
const LIVE_REGION_RADIUS = 2;

/**
 * Is this sprite in the part of the room the player is actually in?
 *
 * The clear test the game runs walks its sixteen LIVE sprite slots. What we hold
 * instead is the room's whole static spawn list, and one room slot can cover
 * several scrolling sections, each with its own shutters and its own guard. The
 * castle's boomerang room is two: enter the first and its shutters slam until you
 * kill the guard standing there; the section to its east then does the same with
 * its own. Judging both sections at once makes each look unclearable, because
 * neither guard can be struck from the other side.
 *
 * Sprites are counted per section, not per room slot. Inside a section the rule
 * stays absolute — every gating sprite there has to be killable, so this cannot
 * clear a room off one convenient kill while another enemy stands beside it.
 */
const inLivePart = (tile: SimSprite['tile'], reached: boolean[][] | undefined): boolean => {
  if (!reached) return true;
  for (let dr = -LIVE_REGION_RADIUS; dr <= LIVE_REGION_RADIUS; dr++) {
    for (let dc = -LIVE_REGION_RADIUS; dc <= LIVE_REGION_RADIUS; dc++) {
      if (reached[tile.row + dr]?.[tile.col + dc]) return true;
    }
  }
  return false;
};

/** Unknown flags4 (no combat row for this sprite type) defaults to gating: a
 *  room can't be called clear on the strength of a sprite we know nothing about. */
const isGating = (info: SpriteCombatInfo | null): boolean =>
  !info || (info.flags4 & ROOM_CLEAR_EXEMPT_BIT) === 0;

const evaluateSprite = (
  sprite: SimSprite,
  info: SpriteCombatInfo | null,
  weapons: Weapon[],
  reached: boolean[][] | undefined,
  grids: ScreenGridBundle | undefined,
  collisionTable: number[] | undefined,
): EnemyReach => {
  if (!info) return { sprite, health: 0, killable: false, blockedBy: 'gated-off' };
  const damaging = weapons.filter((w) => info.damageByClass[w.damageClass] > 0);
  if (damaging.length === 0) return { sprite, health: info.health, killable: false, blockedBy: 'no-weapon' };
  for (const weapon of damaging) {
    const from = findPositionFor(weapon, sprite.tile, reached, grids, collisionTable);
    if (from) return { sprite, health: info.health, killable: true, by: weapon, from };
  }
  return { sprite, health: info.health, killable: false, blockedBy: 'no-line' };
};

/**
 * For every sprite that gates the current room's clear, decide whether the
 * inventory can kill it from a standable tile. `combat` missing, or carrying
 * null tables, means combat reasoning is unavailable (the developer-tools
 * combat gate is off) — every gating sprite then reads as not killable.
 */
const evaluateRoomThreat = (params: {
  sprites: SimSprite[];
  reached: boolean[][] | undefined;
  grids: ScreenGridBundle | undefined;
  inventory: Set<string>;
  combat: CombatContext | undefined;
}): RoomThreat => {
  const { sprites, reached, grids, inventory, combat } = params;
  const tables = combat?.tables ?? null;
  const infoFor = (spriteType: number): SpriteCombatInfo | null => (tables ? (combat?.bySpriteType[spriteType] ?? null) : null);
  const weapons = tables ? weaponsFor(inventory, tables) : [];
  const gating = sprites
    .map((sprite) => ({ sprite, info: infoFor(sprite.spriteType) }))
    .filter(({ info }) => isGating(info))
    .filter(({ sprite }) => inLivePart(sprite.tile, reached))
    .map(({ sprite, info }) => evaluateSprite(sprite, info, weapons, reached, grids, tables?.projectileTileCollision));
  return { gating, clearable: gating.every((e) => e.killable) };
};

export { evaluateRoomThreat, isGating };
export type { EnemyReach, RoomThreat, Weapon, ReachKind };
