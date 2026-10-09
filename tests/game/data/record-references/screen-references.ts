/* @layer tests @kind helper */
import type { ScreenRecord } from '@rotp/game-data';
import type { Sink } from './record-references.type';

const screenReferences = (screen: ScreenRecord, take: Sink): void => {
  take('area', 'areaId', screen.areaId);
  take('location', 'locationId', screen.locationId);
  take('region', 'regionId', screen.regionId);
  take('screen', 'bounds.screenId', screen.bounds?.screenId);
  for (const id of screen.triggerIds ?? []) take('actor', 'triggerIds', id);
  for (const spawn of screen.spawns ?? []) take('actor', 'spawns[].actorId', spawn.actorId);
  for (const id of screen.tags) take('tag', 'tags', id);
  if (screen.variant?.condition.type === 'check') take('check', 'variant.condition.id', screen.variant.condition.id);
};

export { screenReferences };
