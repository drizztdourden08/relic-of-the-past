/* @layer shared-hud @kind logic */
import type { Issues } from './validate-box.type';

const numberAt = (value: unknown, path: string, issues: Issues): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push(`${path}: expected a finite number, got ${JSON.stringify(value)}`);
    return undefined;
  }
  return value;
};

export { numberAt };
