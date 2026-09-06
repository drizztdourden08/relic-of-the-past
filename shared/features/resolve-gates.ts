/* @layer shared @kind logic */
/**
 * Vanilla Safe entry point for the feature resolver: forces off every FeatureDef with
 * affectsVanillaParity: true, no exemptions. This is the TS settings pipeline; the un-bypassable
 * C-side mirror is zelda_rtl.c's SyncGateWords (kGateWordParityMask).
 */
import type { FeatureDef } from './feature.type'
import { FEATURES_BY_ID } from './feature-registry'
import { resolveFeatures } from './resolve-features'
import type { ResolveResult } from './resolve-features'

interface ResolveGatesOptions {
  /** When true, every parity-affecting id is stripped from the requested set before the fixpoint runs. */
  vanillaSafe: boolean
}

/**
 * Strip every affectsVanillaParity id when `vanillaSafe` is on, then run the requires-fixpoint
 * (resolveFeatures) so dependents of a stripped id die too, with no separate list to maintain.
 * Ids with no registry entry are left alone, same forward-compat contract as resolveFeatures.
 */
const resolveGates = (requested: Iterable<string>, { vanillaSafe }: ResolveGatesOptions): ResolveResult => {
  const isParityAffecting = (id: string): boolean => (FEATURES_BY_ID as Record<string, FeatureDef | undefined>)[id]?.affectsVanillaParity === true
  const seed = vanillaSafe ? [...requested].filter((id) => !isParityAffecting(id)) : requested
  return resolveFeatures(seed)
}

export { resolveGates }
export type { ResolveGatesOptions }
