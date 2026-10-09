/* @layer shared-game @kind logic */
import type { RequirementSet, TraversalRequirement } from '@rotp/game-data';
import type { ConnectionTag } from '@rotp/game-data';
import { BARRIER_TO_TOKEN } from '@rotp/game-data';

const barrierTagsToRequirements = (tags: readonly ConnectionTag[]): RequirementSet => {
  const group: TraversalRequirement[] = [];
  for (const tag of tags) {
    if (tag === 'barrier:small-key') group.push('smallkey:*');
    else if (tag === 'barrier:big-key') group.push('bigkey:*');
    else {
      const token = BARRIER_TO_TOKEN[tag];
      if (token) group.push(token);
    }
  }
  return group.length > 0 ? [group] : [];
};

export { barrierTagsToRequirements };
