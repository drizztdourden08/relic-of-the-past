/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { duplicateInstalled } from './duplicate';
import { configureHookshop } from './hookshop';
import { toStoreResult } from './store-result';

const registerStoreHandlers = (ctx: MainContext): void => {
  configureHookshop(ctx);
  handle('store:duplicate', (_event, itemId) => toStoreResult(() => duplicateInstalled(itemId)));
};

export { registerStoreHandlers };
