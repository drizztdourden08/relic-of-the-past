/* @layer shared-hud @kind logic */
import { widthHeightAt } from '../validate-box';
import { validateValue } from '../validate-value';
import type { Issues } from '../validate-box';
import type { Value } from '../../types/hud-value';

const minMaxAt = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): { w?: Value; h?: Value } | undefined =>
  widthHeightAt(value, path, issues, (inner, innerPath) => validateValue(inner, innerPath, issues, { insideRepeat }));

export { minMaxAt };
