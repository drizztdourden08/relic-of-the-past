/* @layer renderer-lib @kind logic */
import * as languages from '@shared/storage/languages';
import type { SetFontBytes } from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const getLanguageSetFont = (id: string): Promise<SetFontBytes | null> => languages.getSetFont(platformFiles(), id);

export { getLanguageSetFont };
