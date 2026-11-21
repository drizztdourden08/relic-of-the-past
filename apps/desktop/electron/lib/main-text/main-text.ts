/* @layer electron-main @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { MAIN_CONTEXT_HOLDER } from './main-text.constants';

const mainText = (text: Text): string => {
  if (MAIN_CONTEXT_HOLDER.current) return MAIN_CONTEXT_HOLDER.current.i18n.text(text);
  return typeof text === 'string' ? text : text.key;
};

export { mainText };
