/* @layer shared-hud @kind logic */
import { validateValue } from '../validate-value';
import type { Issues } from '../validate-box';
import type { ValueContext } from '../validate-value.type';

const gateAt = (value: unknown, path: string, issues: Issues, context: ValueContext): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') { issues.push(`${path}: expected an expression string`); return undefined; }
  const wrapped = validateValue({ from: 'data', expr: value }, path, issues, context);
  return wrapped === undefined ? undefined : value;
};

export { gateAt };
