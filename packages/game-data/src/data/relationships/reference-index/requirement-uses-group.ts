/* @layer shared-game @kind logic */
import type { Requirement } from '../../types';

const requirementUsesGroup = (req: Requirement, groupId: string): boolean => {
  if ('count' in req) return req.count.groupId === groupId;
  if ('allOf' in req) return req.allOf.some(sub => requirementUsesGroup(sub, groupId));
  if ('anyOf' in req) return req.anyOf.some(sub => requirementUsesGroup(sub, groupId));
  return false;
};

export { requirementUsesGroup };
