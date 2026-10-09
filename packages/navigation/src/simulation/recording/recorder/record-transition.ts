/* @layer shared-game @kind logic */
import type { TraversalId } from '../../traversal-id.type';
import type { RecorderState } from './recorder.type';

const recordTransition = (rec: RecorderState, from: TraversalId, to: TraversalId): void => {
  if (!rec.transitions.some(t => t.from === from && t.to === to)) rec.transitions.push({ from, to });
};

export { recordTransition };
