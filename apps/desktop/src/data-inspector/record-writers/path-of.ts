/* @layer renderer-app @kind logic */
import type { FileTarget } from '@rotp/game-data';
import { optionText } from '@rotp/randomizer';
import { NO_SOURCE_FILE } from '@app/views/DataInspector/DataInspector.constants';

const pathOf = (target: FileTarget): string => {
  if (!target.relativePath) throw new Error(target.unresolved ?? optionText(NO_SOURCE_FILE));
  return target.relativePath;
};

export { pathOf };
