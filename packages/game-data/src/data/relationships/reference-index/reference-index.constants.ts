/* @layer shared-game @kind constants */
import type { EntityKind } from '../../types';
import {
  referencesToActor, referencesToArea, referencesToCheck, referencesToDungeon,
  referencesToItem, referencesToLocation,
} from '../dataset-references';
import type { ReferenceHit } from '../reference-index.type';
import { referencesToItemGroup } from './references-to-item-group';
import { referencesToTag } from './references-to-tag';

const REVERSE_INDEX = {
  tag: referencesToTag,
  'item-group': referencesToItemGroup,
  check: referencesToCheck,
  item: referencesToItem,
  dungeon: referencesToDungeon,
  area: referencesToArea,
  location: referencesToLocation,
  actor: referencesToActor,
} as const satisfies Partial<Record<EntityKind, (id: string) => ReferenceHit[]>>;

const REFERENCE_TARGETS = Object.keys(REVERSE_INDEX) as readonly (keyof typeof REVERSE_INDEX)[];

export { REFERENCE_TARGETS, REVERSE_INDEX };
