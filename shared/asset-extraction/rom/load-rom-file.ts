/* @layer shared-asset-extraction @kind logic */
/**
 * Node-only ROM loading from a file path. Kept separate from rom-loader so the
 * browser/Worker asset pipeline (loadRomFromBuffer) carries no `fs` import.
 */
import { readFileSync } from 'fs';
import type { RomData } from './rom-types';
import { loadRomFromBuffer } from './rom-loader';

const loadRom = (path: string, supportMultilanguage = false): RomData =>
  loadRomFromBuffer(Buffer.from(readFileSync(path)), supportMultilanguage);

export { loadRom };
