/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { MAIN_CONTEXT_HOLDER } from './main-text.constants';

const bindMainText = (ctx: MainContext): void => {
  MAIN_CONTEXT_HOLDER.current = ctx;
};

export { bindMainText };
