/* @layer shared @kind logic */
import type { FeatureDef } from './feature.type'
import { FEATURES_BY_ID } from './feature-registry'
import { resolveFeatures } from './resolve-features'
import type { ResolveResult } from './resolve-features'
import type { ResolveGatesOptions } from './resolve-gates.type'

const resolveGates = (requested: Iterable<string>, { vanillaSafe }: ResolveGatesOptions): ResolveResult => {
  const isParityAffecting = (id: string): boolean => (FEATURES_BY_ID as Record<string, FeatureDef | undefined>)[id]?.affectsVanillaParity === true
  const seed = vanillaSafe ? [...requested].filter((id) => !isParityAffecting(id)) : requested
  return resolveFeatures(seed)
}

export { resolveGates }
export type { ResolveGatesOptions }
