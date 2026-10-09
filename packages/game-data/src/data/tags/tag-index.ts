/* @layer shared-game @kind logic */
import type { TagRecord } from '../types';
import { ALL_TAGS } from './tags.constants';

const tagIndex = {
  byId: new Map<string, TagRecord>(ALL_TAGS.map(tag => [tag.id, tag])),
  byKey: new Map<string, TagRecord>(ALL_TAGS.map(tag => [tag.name, tag])),
};

export { tagIndex };
