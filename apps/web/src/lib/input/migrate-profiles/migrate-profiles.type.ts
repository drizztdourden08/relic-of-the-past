/* @layer renderer-lib @kind types */
import type { InputProfile } from '@shared/types/controls';

interface MigrationOutcome {
  profiles: InputProfile[];
  failures: string[];
}

export type { MigrationOutcome };
