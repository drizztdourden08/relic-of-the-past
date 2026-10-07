/* @layer bridge-wasm @kind logic */
// One sprite -> one annotation. Key carriers come first (a lock's key, not scenery). A pull
// switch says which shutters it serves; the shutter is the reason the run walks to it.
import type { ScreenAnnotation } from '@shared/game/simulation';
import type { SimSprite } from '@shared/game/simulation';
import type { CheckId } from '@shared/game/data';
import { checkForStandingItem } from '@shared/game/simulation';
import { npcCheckFor } from './npc-checks';
import { standingItemId } from '../../simulator/sprite-kinds';
import { itemLabel } from '@shared/game/logic/queries/item-duplicates';

/** Sprite_PullSwitch_bounce covers sprite types 0x04-0x07. */
const isPullSwitch = (t: number): boolean => t >= 0x04 && t <= 0x07;
/** The captive princess NPC. The throne gate waits on this follower. */
const PRINCESS_SPRITE = 0x76;

interface SpriteContext {
  roomId: number;
  completed: ReadonlySet<CheckId>;
  /** Shutter doors in this room. A pull switch here opens them. */
  shutterCount: number;
}

/**
 * Which spawn table this sprite was read from. Not cosmetic: a sprite type is not unique
 * across the two worlds (0x2e is both the flute boy and the stump), and only the overworld
 * table's index (the screen) settles which it is.
 */
const sourceNote = (sprite: SimSprite): string =>
  sprite.outdoor ? 'overworld spawn' : 'room spawn';

const spriteAnnotation = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation | null => {
  const tile = sprite.tile;

  if (sprite.carriesBigKey) return { kind: 'big-key-carrier', tile, label: 'big key guard', requires: ['sword'] };
  if (sprite.carriesKey) return { kind: 'key-carrier', tile, label: 'key guard', requires: ['sword'] };

  if (isPullSwitch(sprite.spriteType)) {
    return { kind: 'pull-switch', tile, label: 'pull switch',
      ...(ctx.shutterCount > 0 ? { detail: `opens ${ctx.shutterCount} shutter${ctx.shutterCount > 1 ? 's' : ''}` } : {}) };
  }

  const check = npcCheckFor(sprite.spriteType, sprite.roomId, ctx.completed, sprite.outdoor);
  if (check) {
    return { kind: 'npc-check', tile, checkId: check.checkId, label: check.name, detail: sourceNote(sprite), state: check.done ? 'done' : 'available' };
  }
  if (sprite.spriteType === PRINCESS_SPRITE) return { kind: 'npc-check', tile, label: 'Princess' };
  if (sprite.kind === 'npc') return { kind: 'npc-check', tile, label: `npc 0x${sprite.spriteType.toString(16)}` };
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') {
    // Name what it hands over, not 'item'; the simulator resolves the same id to decide
    // the pickup, so both agree on what is lying there.
    const itemId = standingItemId(sprite.spriteType);
    // A standing item IS a check, resolved from the same flag the pickup writes.
    // Without its id the marker had no identity and always read as available,
    // whatever the run had already collected.
    const pickup = checkForStandingItem(sprite);
    return {
      kind: 'standing-item',
      tile,
      label: itemId === undefined ? 'item' : itemLabel(itemId),
      ...(pickup ? { checkId: pickup.id, state: ctx.completed.has(pickup.id) ? 'done' as const : 'available' as const } : {}),
    };
  }

  return null;
};

export { spriteAnnotation, isPullSwitch, PRINCESS_SPRITE };
export type { SpriteContext };
