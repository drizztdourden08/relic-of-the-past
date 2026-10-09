/* @layer renderer-components @kind logic */
import { resolveValue } from '@rotp/hud';
import type { Value } from '@rotp/hud';
import type { Scope } from './formula-scope.type';

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

export { instanceScopes };
