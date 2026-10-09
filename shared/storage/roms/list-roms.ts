/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { RomKind } from '../rom-kinds';
import { listEntries } from './list-entries';

const listRoms = async (files: FileStore, kind: RomKind = 'snes-alttp'): Promise<string[]> =>
  (await listEntries(files)).filter((entry) => entry.kind === kind).map((entry) => entry.romFile);

export { listRoms };
