/* @layer tests @kind helper */
import type { Requirement } from '@shared/game/data/types';
import type { Sink } from './record-references.type';

const walkRequirement = (requirement: Requirement, field: string, take: Sink): void => {
  if ('allOf' in requirement) { for (const sub of requirement.allOf) walkRequirement(sub, field, take); return; }
  if ('anyOf' in requirement) { for (const sub of requirement.anyOf) walkRequirement(sub, field, take); return; }
  if ('itemId' in requirement) take('item', field, requirement.itemId);
  if ('checkId' in requirement) take('check', field, requirement.checkId);
  if ('count' in requirement) take('item-group', field, requirement.count.groupId);
};

export { walkRequirement };
