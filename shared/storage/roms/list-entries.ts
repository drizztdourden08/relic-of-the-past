/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { kindOfFile } from '../rom-kinds';
import type { RomEntry } from './roms.type';

const listEntries = async (files: FileStore): Promise<RomEntry[]> =>
  (await files.list('roms')).flatMap((romFile) => {
    const kind = kindOfFile(romFile);
    return kind ? [{ romFile, kind }] : [];
  });

export { listEntries };
