/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation, SimSprite } from '../../simulation';
import { checkForStandingItem } from '../../simulation';
import { npcCheckFor } from './npc-checks';
import { standingItemId } from '../../simulator/sprite-kinds';
import { itemLabel } from '@rotp/game-data';
import { PRINCESS_SPRITE, PULL_SWITCH_FIRST, PULL_SWITCH_LAST } from './sprites.constants';
import type { SpriteContext } from './sprites.type';

const isPullSwitch = (t: number): boolean => t >= PULL_SWITCH_FIRST && t <= PULL_SWITCH_LAST;

const sourceNote = (sprite: SimSprite): string =>
  sprite.outdoor ? 'overworld spawn' : 'room spawn';

const standingItemAnnotation = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation => {
  const itemId = standingItemId(sprite.spriteType);
  const pickup = checkForStandingItem(sprite);
  return {
    kind: 'standing-item',
    tile: sprite.tile,
    label: itemId === undefined ? 'item' : itemLabel(itemId),
    ...(pickup ? { checkId: pickup.id, state: ctx.completed.has(pickup.id) ? 'done' as const : 'available' as const } : {}),
  };
};

const pullSwitchDetail = (shutterCount: number): Pick<ScreenAnnotation, 'detail'> => {
  if (shutterCount <= 0) return {};
  return { detail: `opens ${shutterCount} shutter${shutterCount > 1 ? 's' : ''}` };
};

const guardOrSwitch = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation | null => {
  const tile = sprite.tile;
  if (sprite.carriesBigKey) return { kind: 'big-key-carrier', tile, label: 'big key guard', requires: ['sword'] };
  if (sprite.carriesKey) return { kind: 'key-carrier', tile, label: 'key guard', requires: ['sword'] };
  if (isPullSwitch(sprite.spriteType)) return { kind: 'pull-switch', tile, label: 'pull switch', ...pullSwitchDetail(ctx.shutterCount) };
  return null;
};

const spriteAnnotation = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation | null => {
  const tile = sprite.tile;
  const guard = guardOrSwitch(sprite, ctx);
  if (guard) return guard;

  const check = npcCheckFor(sprite.spriteType, sprite.roomId, ctx.completed, sprite.outdoor);
  if (check) {
    return { kind: 'npc-check', tile, checkId: check.checkId, label: check.name, detail: sourceNote(sprite), state: check.done ? 'done' : 'available' };
  }
  if (sprite.spriteType === PRINCESS_SPRITE) return { kind: 'npc-check', tile, label: 'Princess' };
  if (sprite.kind === 'npc') return { kind: 'npc-check', tile, label: `npc 0x${sprite.spriteType.toString(16)}` };
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') return standingItemAnnotation(sprite, ctx);

  return null;
};

export { spriteAnnotation };
export type { SpriteContext } from './sprites.type';
