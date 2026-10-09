/* @layer renderer-lib @kind types */
import type { InputProfile } from '@shared/types/controls/devices/devices.type';

interface MigrationOutcome {
  profiles: InputProfile[];
  failures: string[];
}

export type { MigrationOutcome };
