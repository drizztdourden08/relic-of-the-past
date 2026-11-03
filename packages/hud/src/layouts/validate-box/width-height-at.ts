/* @layer shared-hud @kind logic */
import { checkKeys } from './check-keys';
import { isRecord } from './is-record';
import type { Issues } from './validate-box.type';

const widthHeightAt = <T>(
  value: unknown, path: string, issues: Issues, read: (inner: unknown, innerPath: string) => T | undefined,
): { w?: T; h?: T } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    issues.push(`${path}: expected { w?, h? }`);
    return undefined;
  }
  checkKeys(value, ['w', 'h'], path, issues);
  const w = value.w !== undefined ? read(value.w, `${path}.w`) : undefined;
  const h = value.h !== undefined ? read(value.h, `${path}.h`) : undefined;
  return { ...(w !== undefined ? { w } : {}), ...(h !== undefined ? { h } : {}) };
};

export { widthHeightAt };
