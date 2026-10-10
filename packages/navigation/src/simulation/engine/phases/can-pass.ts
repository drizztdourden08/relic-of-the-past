/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';
import type { ScreenEdge } from '../traversal/traversal.type';
import { requirementsMet } from '../../requirements-map/requirements-met';
import { buildReachContext } from '../explorer/build-reach-context';

const canPass = (s: EngineState) => (edge: ScreenEdge): boolean => requirementsMet(edge.requirements, buildReachContext(s));

export { canPass };
