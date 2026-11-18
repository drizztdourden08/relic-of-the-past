/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { RomKind, RomVerdict } from '@rotp/roms';

interface RomCheck extends Omit<RomVerdict, 'message'> {
  message: string;
  file: File;
}

type RomCheckMode = 'official' | 'patched';

interface PickedRom {
  files: File[];
  mode: RomCheckMode;
  expected: RomKind | undefined;
  text: (text: Text) => string;
  on: { file: (file: File | null) => void; check: (check: RomCheck) => void };
}

export type { PickedRom, RomCheck, RomCheckMode };
