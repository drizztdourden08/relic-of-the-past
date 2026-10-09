/* @layer tests @kind helper */
import type { CheckRecord } from '@shared/game/data/types';
import type { Sink } from './record-references.type';
import { walkPresence } from './walk-presence';
import { walkRequirement } from './walk-requirement';

const checkReferences = (check: CheckRecord, take: Sink): void => {
  take('screen', 'screenId', check.screenId);
  take('region', 'regionId', check.regionId);
  take('dungeon', 'dungeonId', check.dungeonId);
  take('actor', 'actorId', check.actorId);
  for (const id of check.vanillaItemIds) take('item', 'vanillaItemIds', id);
  for (const id of check.tags ?? []) take('tag', 'tags', id);
  for (const id of check.reachAny ?? []) take('screen', 'reachAny', id);
  take('dungeon', 'derivedDungeon.dungeonId', check.derivedDungeon?.dungeonId);
  if (check.requirements) walkRequirement(check.requirements, 'requirements', take);
  if (check.derived) walkRequirement(check.derived, 'derived', take);
  if (check.fallback) walkRequirement(check.fallback, 'fallback', take);
  if (check.presence) walkPresence(check.presence, 'presence', take);
  if (check.now) walkPresence(check.now, 'now', take);
};

export { checkReferences };
