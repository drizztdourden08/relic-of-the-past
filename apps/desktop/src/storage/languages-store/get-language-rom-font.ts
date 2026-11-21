/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import type { RomFontBytes } from '@rotp/languages';
import { platformFiles } from '../platform-files';

const getLanguageRomFont = (code: string): Promise<RomFontBytes | null> => languages.getRomFont(platformFiles(), code);

export { getLanguageRomFont };
