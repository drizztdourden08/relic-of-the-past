/* @layer renderer-components @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { RomKind } from '@rotp/roms';
import type { RomCheck, RomCheckMode } from './rom-check.type';
import { verifyRomFile } from './verify-rom-file';

const checkPickedRom = (
  files: File[],
  mode: RomCheckMode,
  expected: RomKind | undefined,
  text: (text: Text) => string,
  on: { file: (file: File | null) => void; check: (check: RomCheck) => void },
): void => {
  const file = files[0] ?? null;
  on.file(file);
  if (file !== null) void verifyRomFile(file, mode, expected, text).then(on.check);
};

export { checkPickedRom };
