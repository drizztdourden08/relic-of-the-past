/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Scope } from '../engine.type';

const bakeGate = (expr: string | undefined, scope: Scope): string | undefined => (
  expr === undefined ? undefined : (resolveValue({ from: 'data', expr }, scope) !== 0 ? '1' : '0')
);

export { bakeGate };
