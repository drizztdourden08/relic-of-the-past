/* @layer shared-hud @kind logic */
import { validateValue } from '../validate-value';
import type { Issues } from '../validate-box';

const gateAt = (
  value: unknown, path: string, issues: Issues, insideRepeat: boolean, extraNames: readonly string[] = [],
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') { issues.push(`${path}: expected an expression string`); return undefined; }
  const wrapped = validateValue({ from: 'data', expr: value }, path, issues, { insideRepeat, extraNames });
  return wrapped === undefined ? undefined : value;
};

export { gateAt };
