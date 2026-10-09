/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { CatalogMain } from '@drizztdourden08/brock-catalog/main';

const hookshopHolder = {
  ctx: null as MainContext | null,
  catalog: null as CatalogMain | null,
};

export { hookshopHolder };
