/* @layer shared-game @kind logic */
import type { EntityKind, TagRecord } from '../types';
import { ALL_TAGS } from './tags.constants';

const tagsFor = (kind: EntityKind): readonly TagRecord[] =>
  ALL_TAGS.filter(tag => tag.appliesTo.includes(kind));

export { tagsFor };
