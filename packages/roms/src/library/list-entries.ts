/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { kindOfFile } from '../kinds';
import type { RomEntry } from './roms.type';

const listEntries = async (files: FileStore): Promise<RomEntry[]> =>
  (await files.list('roms')).flatMap((romFile) => {
    const kind = kindOfFile(romFile);
    return kind ? [{ romFile, kind }] : [];
  });

export { listEntries };
