/* @layer electron-main @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';

const NO_TARGET = (): string => mainText(msg('screen-editor:record.noTarget'));
const NO_ID = (): string => mainText(msg('screen-editor:record.noId'));

export { NO_ID, NO_TARGET };
