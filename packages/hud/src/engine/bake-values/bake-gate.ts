/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Scope } from '../engine.type';

const bakeGate = (expr: string | undefined, scope: Scope): string | undefined => {
  if (expr === undefined) return undefined;
  return resolveValue({ from: 'data', expr }, scope) !== 0 ? '1' : '0';
};

export { bakeGate };
