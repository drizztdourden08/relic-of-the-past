/* @layer shared-asset-extraction @kind logic */
import type { LanguageConfig } from '../data/language-data';

const orgEncoder = (cmd: string, param: number | null, info: LanguageConfig): number[] => {
  const cmdIndex = info.commandNames.indexOf(cmd);
  if (cmdIndex < 0) throw new Error(`Invalid cmd: ${cmd}`);
  const expectedLen = info.commandLengths[cmdIndex];
  if (expectedLen !== (param === null ? 1 : 2)) {
    throw new Error(`Invalid cmd params: ${cmd} ${param}`);
  }
  if (param === null) {
    return [cmdIndex + info.commandStart];
  }
  return [cmdIndex + info.commandStart, param];
};

export { orgEncoder };
