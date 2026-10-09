/* @layer shared-input @kind constants */
import { GC_FILES, GENERIC_FILES, PLAYSTATION_FILES, SNES_FILES, SWITCH_FILES, XBOX_FILES } from './glyph-files.data';
import { withFolder } from './with-folder';

const GLYPH_ASSET_PATHS: Record<string, string> = {
  ...withFolder('switch', SWITCH_FILES),
  ...withFolder('xbox', XBOX_FILES),
  ...withFolder('playstation', PLAYSTATION_FILES),
  ...withFolder('gc', GC_FILES),
  ...withFolder('generic', GENERIC_FILES),
  ...withFolder('snes', SNES_FILES),
};

export { GLYPH_ASSET_PATHS };
