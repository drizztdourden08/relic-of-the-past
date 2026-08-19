/* @layer shared @kind logic */
/**
 * Vanilla Safe entry point for the feature resolver. Vanilla Safe forces off every divergence from
 * stock game behavior — every FeatureDef with affectsVanillaParity: true, no exemptions. This is the
 * "normal path" (the TS settings pipeline); the un-bypassable C-side mirror lives in
 * zelda_rtl.c's SyncGateWords (see kGateWordParityMask there).
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
 * Seed from the requested set, remove every id whose FeatureDef is affectsVanillaParity: true when
 * `vanillaSafe` is on, then run the existing requires-fixpoint (resolveFeatures) so anything that only
 * depended on a stripped id dies too — automatically, with no separate list to maintain. An id with no
 * registry entry (not yet a FeatureDef) is left alone by the strip step, same forward-compat contract as
 * resolveFeatures itself.
 */
const resolveGates = (requested: Iterable<string>, { vanillaSafe }: ResolveGatesOptions): ResolveResult => {
  const isParityAffecting = (id: string): boolean => (FEATURES_BY_ID as Record<string, FeatureDef | undefined>)[id]?.affectsVanillaParity === true
  const seed = vanillaSafe ? [...requested].filter((id) => !isParityAffecting(id)) : requested
  return resolveFeatures(seed)
}

export { resolveGates }
export type { ResolveGatesOptions }
