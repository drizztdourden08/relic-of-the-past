/* @layer electron-main @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
const TAGS_FILE = ['packages', 'game-data', 'src', 'data', 'records', 'tags', 'tags.ts'] as const;

const CONVENTION = (): string => mainText(msg('screen-editor:tag.convention'));
const NO_SCOPE = (): string => mainText(msg('screen-editor:tag.noScope'));

export { TAGS_FILE, CONVENTION, NO_SCOPE };
