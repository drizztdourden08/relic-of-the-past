/* @layer shared-game @kind logic */
import type { ConnectionTransitType, ConnectionTag } from '@rotp/game-data';
import { TRANSIT_BY_TAG, TRANSIT_TAG_PREFIX } from './connection-updater.constants';

const transitTypeFromTags = (tags: readonly ConnectionTag[]): ConnectionTransitType => {
  const tag = tags.find((t) => t.startsWith(TRANSIT_TAG_PREFIX));
  if (tag === undefined) return 'walk';
  return TRANSIT_BY_TAG[tag.slice(TRANSIT_TAG_PREFIX.length)] ?? 'door';
};

export { transitTypeFromTags };
