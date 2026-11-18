/* @layer renderer-components @kind logic */
import type { PickedRom } from './rom-check.type';
import { verifyRomFile } from './verify-rom-file';

const checkPickedRom = (picked: PickedRom): void => {
  const { files, mode, expected, text, on } = picked;
  const file = files[0] ?? null;
  on.file(file);
  if (file !== null) void verifyRomFile(file, mode, expected, text).then(on.check);
};

export { checkPickedRom };
