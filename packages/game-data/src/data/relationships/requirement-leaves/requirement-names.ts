/* @layer shared-game @kind logic */
import type { Requirement } from '../../types';
import type { RequirementLeaf } from './requirement-leaves.type';

const requirementNames = (req: Requirement, leaf: RequirementLeaf, id: string): boolean => {
  if ('allOf' in req) return req.allOf.some(sub => requirementNames(sub, leaf, id));
  if ('anyOf' in req) return req.anyOf.some(sub => requirementNames(sub, leaf, id));
  if (leaf === 'groupId') return 'count' in req && req.count.groupId === id;
  if (leaf === 'itemId') return 'itemId' in req && req.itemId === id;
  return 'checkId' in req && req.checkId === id;
};

export { requirementNames };
