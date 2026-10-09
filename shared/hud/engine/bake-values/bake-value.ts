/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Value } from '../../../types/hud/hud-value';
import type { Scope } from '../engine.type';

const bakeValue = (value: Value | undefined, scope: Scope): Value | undefined => (
  value === undefined ? undefined : resolveValue(value, scope)
);

export { bakeValue };
