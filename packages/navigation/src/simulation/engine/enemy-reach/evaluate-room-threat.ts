/* @layer shared-game @kind logic */
import type { SimSprite, SpriteCombatInfo } from '../../types';
import type { FiringScene } from '../enemy-reach-geometry/enemy-reach-geometry.type';
import { weaponsFor } from '../enemy-reach-weapons/weapons-for';
import { findPositionFor } from '../enemy-reach-geometry/find-position-for';
import type { EnemyReach, RoomThreat, RoomThreatParams, Weapon } from './enemy-reach.type';
import { inSameSection } from './in-same-section';
import { isGating } from './is-gating';

const evaluateSprite = (
  sprite: SimSprite,
  info: SpriteCombatInfo | null,
  weapons: Weapon[],
  scene: FiringScene,
): EnemyReach => {
  if (!info) return { sprite, health: 0, killable: false, blockedBy: 'gated-off' };
  const damaging = weapons.filter((w) => (info.damageByClass[w.damageClass] ?? 0) > 0);
  if (damaging.length === 0) return { sprite, health: info.health, killable: false, blockedBy: 'no-weapon' };
  for (const weapon of damaging) {
    const from = findPositionFor(weapon, sprite.tile, scene);
    if (from) return { sprite, health: info.health, killable: true, by: weapon, from };
  }
  return { sprite, health: info.health, killable: false, blockedBy: 'no-line' };
};

const evaluateRoomThreat = (params: RoomThreatParams): RoomThreat => {
  const { sprites, reached, grids, inventory, combat, split } = params;
  const tables = combat?.tables ?? null;
  const infoFor = (spriteType: number): SpriteCombatInfo | null => (tables ? (combat?.bySpriteType[spriteType] ?? null) : null);
  const weapons = tables ? weaponsFor(inventory, tables) : [];
  const gating = sprites
    .map((sprite) => ({ sprite, info: infoFor(sprite.spriteType) }))
    .filter(({ info }) => isGating(info))
    .filter(({ sprite }) => inSameSection(sprite.tile, split))
    .map(({ sprite, info }) => evaluateSprite(sprite, info, weapons, { reached, bundle: grids, collisionTable: tables?.projectileTileCollision }));
  return { gating, clearable: gating.every((e) => e.killable) };
};

export { evaluateRoomThreat };
