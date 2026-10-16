/* @layer renderer-components @kind constants */
import type { ExtractedStatus } from '../SpriteManager.type';

const NO_ROMS_MESSAGE = 'No ROMs available. Import a ROM first.';

const romLabel = (romFile: string, extractedMap: Record<string, ExtractedStatus>) =>
  extractedMap[romFile]?.extracted ? `${romFile} (has sprites)` : romFile;

export { NO_ROMS_MESSAGE, romLabel };
