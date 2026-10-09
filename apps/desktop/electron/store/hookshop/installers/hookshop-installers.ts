/* @layer electron-main @kind logic */
import type { CatalogInstaller } from '@drizztdourden08/brock-catalog/main';
import { INSTALLERS } from '@rotp/packs';
import { catalogInstallerOf } from './catalog-installer-of';

const hookshopInstallers = (): Record<string, CatalogInstaller> =>
  Object.fromEntries(Object.entries(INSTALLERS).map(([container, pack]) => [container, catalogInstallerOf(pack)]));

export { hookshopInstallers };
