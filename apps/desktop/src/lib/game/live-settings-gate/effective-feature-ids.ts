/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { resolveGates } from '@rotp/features';
import { requestedFeatureIds } from './requested-feature-ids';

const effectiveFeatureIds = (s: GameSettings): Set<string> =>
  resolveGates(requestedFeatureIds(s), { vanillaSafe: s.vanillaSafe }).effective;

export { effectiveFeatureIds };
