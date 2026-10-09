/* @layer electron-main @kind logic */
import { configureCatalog } from '@drizztdourden08/brock-catalog/main';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { hookshopConfig } from './hookshop-config';
import { hookshopHolder } from './hookshop-holder';

const configureHookshop = (ctx: MainContext): void => {
  hookshopHolder.ctx = ctx;
  hookshopHolder.catalog = configureCatalog(ctx, hookshopConfig());
};

export { configureHookshop };
