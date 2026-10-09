/* @layer shared-asset-extraction @kind logic */
import { readFileSync } from 'fs';
import { loadGbaAlttpRomFromBuffer } from './gba-rom';
import type { GbaRomReader } from './gba-rom';

const loadGbaAlttpRom = (path: string): GbaRomReader =>
  loadGbaAlttpRomFromBuffer(Buffer.from(readFileSync(path)));

export { loadGbaAlttpRom };
