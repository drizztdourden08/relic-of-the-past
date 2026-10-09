/* @layer renderer-app @kind logic */
import type { FileTarget } from '@rotp/game-data';
import { NO_SOURCE_FILE } from '../../DataInspector.constants';

const pathOf = (target: FileTarget): string => {
  if (!target.relativePath) throw new Error(target.unresolved ?? NO_SOURCE_FILE);
  return target.relativePath;
};

export { pathOf };
