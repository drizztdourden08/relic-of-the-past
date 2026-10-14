/* @layer shared-hud @kind logic */
import { compileExpr } from '../compile-expr';
import { clampFinite } from './clamp-finite';
import type { Value } from '../../types/hud-value';

const isMalformedValue = (value: unknown): boolean =>
  typeof value !== 'object' || value === null || !('expr' in value) || typeof value.expr !== 'string';

const resolveValue = (value: Value, scope: Readonly<Record<string, number>>): number => {
  if (typeof value === 'number') return clampFinite(value);
  if (isMalformedValue(value)) return 0;

  const compiled = compileExpr(value.expr);
  if (!compiled.ok) return 0;

  const result = compiled.expr.evaluate(scope);
  if (!result.ok) return 0;

  return clampFinite(result.value);
};

export { resolveValue };
