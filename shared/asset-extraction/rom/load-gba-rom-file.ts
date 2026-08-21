/* @layer shared-asset-extraction @kind logic */
/** Node-only GBA ROM loading, parallel to load-rom-file.ts for SNES ROMs. */
import { readFileSync } from 'fs';
import { loadGbaAlttpRomFromBuffer } from './gba-rom';
import type { GbaRomReader } from './gba-rom';

const loadGbaAlttpRom = (path: string): GbaRomReader =>
  loadGbaAlttpRomFromBuffer(Buffer.from(readFileSync(path)));

export { loadGbaAlttpRom };
