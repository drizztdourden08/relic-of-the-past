/* @layer renderer-components @kind hook */
/**
 * A formula inside a `repeat` does not produce one value. It produces `count` of
 * them, and every heart formula in this project is inside one. Printing `→ 1`
 * for something that is 1 fourteen times and 0 six times is not a preview, it
 * is a sample of size one presented as an answer. `InstanceStrip` needs the
 * whole set, so it needs the enclosing repeat's own count and `item`.
 *
 * CARRIED AS CONTEXT INSTEAD OF AS A PROP, and that is the whole reason this
 * file exists. `insideRepeat` is already threaded through roughly thirty call
 * sites as a boolean; widening it to carry the instance scopes would mean
 * touching every one of them for information not one of them uses. The
 * inspector knows the document and the node, so it answers once, at the root of
 * the panel, and the field reads it where it is needed.
 *
 * DEFAULT IS "NOTHING KNOWN", NOT "NOT IN A REPEAT". A field rendered outside
 * the provider (a test fixture, an SSR measurement harness) still says it is in
 * a repeat if its own `insideRepeat` prop says so. It just cannot draw the
 * strip. The two facts come from different places on purpose.
 */
import { createContext, useContext } from 'react';
import { resolveValue } from '@shared/hud/data';
import type { Value } from '@shared/types/hud';

type Scope = Readonly<Record<string, number>>;

/** Kept in step with `engine/expand.ts`'s own clamp: a repeat's count is
 *  floored and never negative. The strip caps its own drawing separately. */
const instanceScopes = (
  repeat: { count: Value; item?: string } | null, scope: Scope,
): readonly Scope[] => {
  if (!repeat) return [];
  const count = Math.max(0, Math.floor(resolveValue(repeat.count, scope)));
  const itemExpr = repeat.item ?? 'index';
  return Array.from({ length: count }, (_unused, index) => {
    const pass = { ...scope, index, count };
    return { ...pass, item: resolveValue({ from: 'data', expr: itemExpr }, pass) };
  });
};

const FormulaScopeContext = createContext<readonly Scope[]>([]);

/** Every instance scope the selected node's enclosing repeat produces, or an
 *  empty list when there is no repeat above it or no provider at all. */
const useInstanceScopes = (): readonly Scope[] => useContext(FormulaScopeContext);

export { FormulaScopeContext, instanceScopes, useInstanceScopes };
export type { Scope };
