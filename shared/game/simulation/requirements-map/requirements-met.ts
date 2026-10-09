/* @layer shared-game @kind logic */
import type { RequirementSet, TraversalRequirement } from '@rotp/game-data';
import type { ReachContext } from './requirements-map.type';
import { ANY_DUNGEON, keyTargetOf } from '../dungeon-key-target';

const bigKeyMet = (suffix: string, ctx: ReachContext): boolean => {
  const target = keyTargetOf(suffix);
  return target !== null && target !== ANY_DUNGEON && ctx.bigKeys.has(target);
};

const tokenMet = (token: TraversalRequirement, ctx: ReachContext): boolean => {
  if (token.startsWith('smallkey:')) {
    const target = keyTargetOf(token.slice('smallkey:'.length));
    return target !== null && ctx.keyAvailable(target);
  }
  if (token.startsWith('bigkey:')) return bigKeyMet(token.slice('bigkey:'.length), ctx);
  if (token.startsWith('event:')) return ctx.events.has(token.slice('event:'.length));
  return ctx.tokens.has(token);
};

const requirementsMet = (reqSet: RequirementSet, ctx: ReachContext): boolean => {
  if (reqSet.length === 0) return true;
  return reqSet.some(group => group.every(token => tokenMet(token, ctx)));
};

export { requirementsMet };
