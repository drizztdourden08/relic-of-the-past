/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ScreenAnnotation, SimSprite } from '../../simulation';
import { checkForStandingItem } from '../../simulation';
import { npcCheckFor } from './npc-checks';
import { standingItemId } from '../../simulator/sprite-kinds';
import { itemLabel } from '@rotp/game-data';
import { PRINCESS_SPRITE, PULL_SWITCH_FIRST, PULL_SWITCH_LAST } from './sprites.constants';
import type { SpriteContext } from './sprites.type';

const isPullSwitch = (t: number): boolean => t >= PULL_SWITCH_FIRST && t <= PULL_SWITCH_LAST;

const sourceNote = (sprite: SimSprite): Message =>
  (sprite.outdoor ? msg('nav-labels:detail.overworldSpawn') : msg('nav-labels:detail.roomSpawn'));

const standingItemAnnotation = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation => {
  const itemId = standingItemId(sprite.spriteType);
  const pickup = checkForStandingItem(sprite);
  return {
    kind: 'standing-item',
    tile: sprite.tile,
    label: itemId === undefined ? msg('nav-labels:label.item') : itemLabel(itemId),
    ...(pickup ? { checkId: pickup.id, state: ctx.completed.has(pickup.id) ? 'done' as const : 'available' as const } : {}),
  };
};

const pullSwitchDetail = (shutterCount: number): Pick<ScreenAnnotation, 'detail'> => {
  if (shutterCount <= 0) return {};
  return { detail: msg('nav-labels:detail.pullSwitch', { count: shutterCount }) };
};

const guardOrSwitch = (sprite: SimSprite, ctx: SpriteContext): ScreenAnnotation | null => {
  const tile = sprite.tile;
  if (sprite.carriesBigKey) return { kind: 'big-key-carrier', tile, label: msg('nav-labels:label.bigKeyGuard'), requires: ['sword'] };
  if (sprite.carriesKey) return { kind: 'key-carrier', tile, label: msg('nav-labels:label.keyGuard'), requires: ['sword'] };
  if (isPullSwitch(sprite.spriteType)) return { kind: 'pull-switch', tile, label: msg('nav-labels:label.pullSwitch'), ...pullSwitchDetail(ctx.shutterCount) };
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
  if (sprite.spriteType === PRINCESS_SPRITE) return { kind: 'npc-check', tile, label: msg('nav-labels:label.princess') };
  if (sprite.kind === 'npc') return { kind: 'npc-check', tile, label: msg('nav-labels:label.npc', { id: sprite.spriteType.toString(16) }) };
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') return standingItemAnnotation(sprite, ctx);

  return null;
};

export { spriteAnnotation };
