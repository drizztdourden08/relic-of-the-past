/* @layer renderer-components @kind logic */
import { LANGUAGE_NAMES } from './language-names.constants';

const languageLabel = (code: string): string => LANGUAGE_NAMES[code] ?? code;

export { languageLabel };
