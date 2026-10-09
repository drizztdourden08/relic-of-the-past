/* @layer electron-main @kind logic */
import type { InstalledPack } from '@rotp/hub-contracts';

const lockedError = (pack: InstalledPack): Error =>
  new Error(`"${pack.origin.name}" is installed from the Hookshop and read only. Duplicate it to change it.`);

export { lockedError };
