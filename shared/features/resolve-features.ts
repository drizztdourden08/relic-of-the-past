/* @layer shared @kind logic */
/**
 * WIP, not yet wired into the runtime UI. The shipping settings screen cascades inline
 * (SettingsView.withCascade); this is the general replacement, consumed only by
 * tests/features/resolve-features.keep.test.ts for now. Not dead code (plans/settings-registry-map.md).
 */
import type { FeatureDef } from './feature.type'
import { FEATURES_BY_ID } from './feature-registry'

interface ResolveResult {
  /** The set that actually applies after pruning anything with unmet requirements. */
  effective: Set<string>
  /** What got pruned and why, so the UI can explain the auto-disable. */
  autoDisabled: { id: string; missing: string[] }[]
}

/**
 * Prune to a consistent set: a feature stays on only if every id in its `requires` is on. Runs to
 * a fixpoint since disabling one can invalidate a dependent. Unknown ids are left untouched.
 */
const resolveFeatures = (enabled: Iterable<string>): ResolveResult => {
  const effective = new Set(enabled)
  const autoDisabled: { id: string; missing: string[] }[] = []
  let changed = true
  while (changed) {
    changed = false
    for (const id of [...effective]) {
      const def = FEATURES_BY_ID[id]
      if (!def) continue
      const missing = def.requires.filter((r) => !effective.has(r))
      if (missing.length > 0) {
        effective.delete(id)
        autoDisabled.push({ id, missing })
        changed = true
      }
    }
  }
  return { effective, autoDisabled }
}

/**
 * Every dependency that turning `id` on would also need to enable (transitive `requires`),
 * limited to those not already enabled (the "this will also turn on ..." confirmation).
 */
const requirementClosure = (id: string, enabled: ReadonlySet<string>): FeatureDef[] => {
  const out: FeatureDef[] = []
  const seen = new Set<string>([id])
  const visit = (cur: string) => {
    for (const r of FEATURES_BY_ID[cur]?.requires ?? []) {
      if (seen.has(r)) continue
      seen.add(r)
      const def = FEATURES_BY_ID[r]
      if (def && !enabled.has(r)) out.push(def)
      visit(r)
    }
  }
  visit(id)
  return out
}

/** Soft companions to offer (not force) when `id` is newly turned on. */
const suggestionsFor = (id: string, enabled: ReadonlySet<string>): FeatureDef[] =>
  (FEATURES_BY_ID[id]?.suggests ?? [])
    .map((s) => FEATURES_BY_ID[s])
    .filter((d): d is FeatureDef => Boolean(d) && !enabled.has(d.id))

export { resolveFeatures, requirementClosure, suggestionsFor }
export type { ResolveResult }
