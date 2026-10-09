/* @layer shared-hud @kind logic */
import { checkKeys, isRecord } from '../validate-box';
import { validateValue } from '../validate-value';
import type { Issues } from '../validate-box';
import type { Value } from '../../../types/hud/hud-value';

const minMaxAt = (
  value: unknown, path: string, issues: Issues, insideRepeat = false,
): { w?: Value; h?: Value } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected { w?, h? }`);
    return undefined;
  }
  checkKeys(value, ['w', 'h'], path, issues);
  const context = { insideRepeat };
  const w = value.w !== undefined ? validateValue(value.w, `${path}.w`, issues, context) : undefined;
  const h = value.h !== undefined ? validateValue(value.h, `${path}.h`, issues, context) : undefined;
  return { ...(w !== undefined ? { w } : {}), ...(h !== undefined ? { h } : {}) };
};

export { minMaxAt };
