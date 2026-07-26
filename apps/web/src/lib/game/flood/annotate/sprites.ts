/* @layer bridge-wasm @kind logic */
/**
 * One sprite → one annotation. Key carriers come first: an enemy that drops a
 * key is a lock's key, not scenery, and reads as a trigger.
 *
 * A pull switch says which shutters it serves — on its own a switch marker is
 * just a dot, and the shutter it lowers is the reason the run walks to it.
 */
import type { ScreenAnnotation } from '@shared/game/simulation';
import type { SimSprite } from '@shared/game/simulation';
import { npcCheckFor } from './npc-checks';

/** Sprite_PullSwitch_bounce covers sprite types 0x04-0x07. */
const isPullSwitch = (t: number): boolean => t >= 0x04 && t <= 0x07;
/** The captive princess NPC — the follower the throne gate waits on. */
const PRINCESS_SPRITE = 0x76;

interface SpriteContext {
  roomId: number;
  completed: ReadonlySet<string>;
  /** Shutter doors in this room — what a pull switch here opens. */
  shutterCount: number;
}

/**
 * Which spawn table this sprite was read from. It is not cosmetic: a sprite type
 * is not unique across the two worlds (0x2e is both the light-world flute boy and
 * the dark-world stump), and the overworld table's index IS the screen, which is
 * what settles which of the two it is. Nothing else on the sprite can say.
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
    return { kind: 'npc-check', tile, label: check.name, detail: sourceNote(sprite), state: check.done ? 'done' : 'available' };
  }
  if (sprite.spriteType === PRINCESS_SPRITE) return { kind: 'npc-check', tile, label: 'Princess' };
  if (sprite.kind === 'npc') return { kind: 'npc-check', tile, label: `npc 0x${sprite.spriteType.toString(16)}` };
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') return { kind: 'standing-item', tile, label: 'item' };

  return null;
};

export { spriteAnnotation, isPullSwitch, PRINCESS_SPRITE };
export type { SpriteContext };
