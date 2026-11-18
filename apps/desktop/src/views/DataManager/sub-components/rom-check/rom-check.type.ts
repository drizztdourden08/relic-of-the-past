/* @layer renderer-components @kind types */
import type { RomVerdict } from '@rotp/roms';

interface RomCheck extends RomVerdict {
  file: File;
}

type RomCheckMode = 'official' | 'patched';

export type { RomCheck, RomCheckMode };
