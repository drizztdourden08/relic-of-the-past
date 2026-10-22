/* @layer renderer-components @kind logic */
import { PROGRESSIVE_MODES } from '@rotp/randomizer';
import type { ProgressiveFamilyMode } from '@rotp/randomizer';

const modeOf = (value: string): ProgressiveFamilyMode | undefined =>
  PROGRESSIVE_MODES.find((mode) => mode === value);

export { modeOf };
