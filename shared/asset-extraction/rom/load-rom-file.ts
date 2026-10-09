/* @layer shared-asset-extraction @kind logic */
import { readFileSync } from 'fs';
import type { RomData } from './rom-types';
import { loadRomFromBuffer } from './rom-loader';

const loadRom = (path: string, supportMultilanguage = false): RomData =>
  loadRomFromBuffer(Buffer.from(readFileSync(path)), supportMultilanguage);

export { loadRom };
