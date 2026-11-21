/* @layer renderer-app @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { keyName } from './key-name';

const translateKeyLabel = (label: string, t: I18n['t']): string =>
  label.split(' + ').map((part) => keyName(part, t)).join(' + ');

export { translateKeyLabel };
