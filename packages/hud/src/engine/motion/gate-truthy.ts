/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Scope } from '../engine.type';

const gateTruthy = (expr: string, scope: Scope): boolean => resolveValue({ from: 'data', expr }, scope) !== 0;

export { gateTruthy };
