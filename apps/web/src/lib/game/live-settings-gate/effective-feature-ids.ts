/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { resolveGates } from '@shared/features/resolve-gates';
import { requestedFeatureIds } from './requested-feature-ids';

const effectiveFeatureIds = (s: GameSettings): Set<string> =>
  resolveGates(requestedFeatureIds(s), { vanillaSafe: s.vanillaSafe }).effective;

export { effectiveFeatureIds };
