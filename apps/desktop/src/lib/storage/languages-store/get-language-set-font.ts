/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import type { SetFontBytes } from '@rotp/languages';
import { platformFiles } from '../platform-files';

const getLanguageSetFont = (id: string): Promise<SetFontBytes | null> => languages.getSetFont(platformFiles(), id);

export { getLanguageSetFont };
