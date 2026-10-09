/* @layer shared-hud @kind logic */
import type { Issues } from './validate-box.type';

const oneOf = <T extends string>(
  value: unknown, allowed: readonly T[], path: string, issues: Issues,
): T | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  issues.push(`${path}: expected one of ${allowed.join(', ')}, got ${JSON.stringify(value)}`);
  return undefined;
};

export { oneOf };
