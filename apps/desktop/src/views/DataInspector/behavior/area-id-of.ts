/* @layer renderer-app @kind logic */
import { AREA_FIELD } from '../DataInspector.constants';

const areaIdOf = (record: unknown): string | undefined => {
  if (typeof record !== 'object' || record === null) return undefined;
  const value = (record as Record<string, unknown>)[AREA_FIELD];
  return typeof value === 'string' && value !== '' ? value : undefined;
};

export { areaIdOf };
