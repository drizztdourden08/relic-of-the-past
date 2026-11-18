/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { languageNames } from './language-names.constants';

const languageLabel = (code: string, t: I18n['t']): string => languageNames(t)[code] ?? code;

export { languageLabel };
