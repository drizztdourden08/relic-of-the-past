/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { Text } from '@drizztdourden08/brock-core/i18n';

const holder: { current: MainContext | null } = { current: null };

const bindMainText = (ctx: MainContext): void => {
  holder.current = ctx;
};

const mainText = (text: Text): string => {
  if (holder.current) return holder.current.i18n.text(text);
  return typeof text === 'string' ? text : text.key;
};

export { bindMainText, mainText };
