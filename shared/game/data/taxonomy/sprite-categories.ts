/* @layer shared-game @kind data */
/**
 * Sprite kind taxonomy — for the 243 native sprite/monster types
 * (kSpriteInit_Health.length, sprite.c:139), NOT the icon-extraction manifest
 * that used to live at shared/game/sprites/ (that's UI icon data, relocated to
 * data/ui/icon-manifest.ts in Phase 6 — see the correction noted for Phase 1).
 */

type SpriteKind = 'enemy' | 'npc' | 'object' | 'boss';

const SPRITE_KIND_LABELS: Record<SpriteKind, string> = {
  enemy: 'Enemy',
  npc: 'NPC',
  object: 'Object',
  boss: 'Boss',
};

export { SPRITE_KIND_LABELS };
export type { SpriteKind };
