/* @layer renderer-components @kind logic */
import type { RomKind } from '@rotp/roms';
import type { RomCheck, RomCheckMode } from './rom-check.type';
import { verifyRomFile } from './verify-rom-file';

const checkPickedRom = (
  files: File[],
  mode: RomCheckMode,
  expected: RomKind | undefined,
  onFile: (file: File | null) => void,
  onCheck: (check: RomCheck) => void,
): void => {
  const file = files[0] ?? null;
  onFile(file);
  if (file !== null) void verifyRomFile(file, mode, expected).then(onCheck);
};

export { checkPickedRom };
