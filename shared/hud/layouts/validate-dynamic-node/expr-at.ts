/* @layer shared-hud @kind logic */
import { validateValue } from '../validate-value';
import type { Issues } from '../validate-box';

const exprAt = (value: unknown, path: string, issues: Issues, insideRepeat: boolean): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(`${path}: expected a non-empty expression string`);
    return undefined;
  }
  const checked = validateValue({ from: 'data', expr: value }, path, issues, { insideRepeat });
  return checked === undefined ? undefined : value;
};

export { exprAt };
