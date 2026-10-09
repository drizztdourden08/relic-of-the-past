/* @layer shared-hud @kind logic */
import { MAX_REPEAT_COUNT } from '../data/expand-limits.constants';
import type { HudNode } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';

const repeatWorstCase = (count: Value): number => (
  typeof count === 'number' ? Math.max(0, Math.min(MAX_REPEAT_COUNT, Math.floor(count))) : MAX_REPEAT_COUNT
);

const worstCaseNodeCount = (node: HudNode): number => {
  if (node.kind === 'container') {
    return 1 + node.children.reduce((sum, child) => sum + worstCaseNodeCount(child), 0);
  }
  const { element } = node;
  if (element.type === 'repeat') return repeatWorstCase(element.count) * worstCaseNodeCount(element.child);
  if (element.type === 'switch') {
    const branches = [...element.cases.map((c) => c.node), ...(element.otherwise ? [element.otherwise] : [])];
    return 1 + branches.reduce((worst, branch) => Math.max(worst, worstCaseNodeCount(branch)), 0);
  }
  return 1;
};

export { worstCaseNodeCount };
