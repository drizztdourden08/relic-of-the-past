/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SimSprite } from '../../types';
import type { PresenceGameState } from '../../presence/presence.type';
import { evaluatePresence } from '../../presence/evaluate/evaluate-presence';
import { npcConfigForSprite } from '../../trigger/trigger-plans/npc-config-for-sprite';
import { planTrigger } from '../../trigger/trigger-plans/plan-trigger';
import { hasReachableNeighbor } from '../discover-reach/has-reachable-neighbor';
import type { Reached } from '../discover-reach/discover-reach.type';
import { isPullSwitch } from '../discover-switches/is-pull-switch';
import { standingItemPresent } from '../discover-switches/standing-item-present';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope } from './discover.type';
import { EVENT_STEPS, FOLLOWER_SPRITE } from './discover.constants';
import { spriteKey } from './sprite-key';
import { eventStepTarget } from './event-step-target';
import { pullSwitchTarget } from './pull-switch-target';
import { followerTarget } from './follower-target';
import { keyCarrierTarget } from './key-carrier-target';

const interactableReachable = (posKnown: boolean, reached: Reached, tile: GridPos): boolean =>
  !posKnown || hasReachableNeighbor(reached, tile);

const spritePresent = (sprite: SimSprite, presenceState: PresenceGameState | undefined): boolean => {
  const check = npcConfigForSprite(sprite.spriteType, sprite.roomId, sprite.outdoor);
  if (!check?.presence || !presenceState) return true;
  return evaluatePresence(check.presence, presenceState);
};

const spriteLabel = (sprite: SimSprite): string => `${sprite.kind} (room ${sprite.roomId.toString(16)})`;

const plainSpriteTarget = ({ screenId }: DiscoverScope, sprite: SimSprite, key: string, tile: GridPos | undefined): SimTarget | null => {
  const action = planTrigger(sprite);
  if (!action) return null;
  const pickup = sprite.kind === 'standing' || sprite.kind === 'overworld';
  return { screenId, roomId: sprite.roomId, action, key, role: 'check', label: spriteLabel(sprite), noun: pickup ? 'standing item' : sprite.kind, verb: pickup ? 'Picking up' : 'Talking to', tile };
};

const presentTarget = (scope: DiscoverScope, sprite: SimSprite, key: string): SimTarget | null => {
  const tile = sprite.posKnown ? sprite.tile : undefined;
  if (isPullSwitch(sprite.spriteType)) return pullSwitchTarget(scope, sprite, key, tile);
  if (sprite.spriteType === FOLLOWER_SPRITE) return followerTarget(scope, sprite, key, tile);
  if ((sprite.carriesKey || sprite.carriesBigKey) && scope.hasSword) return keyCarrierTarget(scope, sprite, key, tile);
  return plainSpriteTarget(scope, sprite, key, tile);
};

const spriteTarget = (scope: DiscoverScope, sprite: SimSprite, key: string): SimTarget | null => {
  const { reached, obs } = scope;
  const estep = EVENT_STEPS.find((e) => e.sprite === sprite.spriteType && e.room === sprite.roomId);
  if (estep) return eventStepTarget(scope, sprite, estep, key);
  if (!interactableReachable(sprite.posKnown, reached, sprite.tile)) return null;
  if (!spritePresent(sprite, obs.presenceState)) return null;
  if (!standingItemPresent(sprite, obs.presenceState)) return null;
  return presentTarget(scope, sprite, key);
};

const onOtherScreen = ({ owScreen }: DiscoverScope, sprite: SimSprite): boolean =>
  Boolean(sprite.outdoor) && owScreen !== null && sprite.roomId !== owScreen;

const spriteTargets = (scope: DiscoverScope): SimTarget[] => {
  const { state, inter } = scope;
  const targets: SimTarget[] = [];
  for (const sprite of inter.sprites) {
    const key = spriteKey(sprite);
    if (state.done.has(key) || state.failed.has(key)) continue;
    if (onOtherScreen(scope, sprite)) continue;
    const target = spriteTarget(scope, sprite, key);
    if (target) targets.push(target);
  }
  return targets;
};

export { spriteTargets };
