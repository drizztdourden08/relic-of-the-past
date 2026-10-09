/* @layer shared-game @kind logic */
import type { ConnectionTransitType } from '../nav-data.types';
import type { ConnectionTag } from '../../data';
import { TRANSIT_BY_TAG, TRANSIT_TAG_PREFIX } from './connection-updater.constants';

const transitTypeFromTags = (tags: readonly ConnectionTag[]): ConnectionTransitType => {
  const tag = tags.find((t) => t.startsWith(TRANSIT_TAG_PREFIX));
  if (tag === undefined) return 'walk';
  return TRANSIT_BY_TAG[tag.slice(TRANSIT_TAG_PREFIX.length)] ?? 'door';
};

export { transitTypeFromTags };
