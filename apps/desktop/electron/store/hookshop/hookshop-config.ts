/* @layer electron-main @kind logic */
import type { CatalogConfig, CatalogGrant } from '@drizztdourden08/brock-catalog/main';
import { INSTALL_SCHEME } from '@shared/store/deep-link';
import { isStoreKind } from '@shared/store/installed-types';
import { STORE_LIMITS } from '@shared/store/limits';
import { HOOKSHOP_ENDPOINT } from './endpoint/hookshop-endpoint.constants';
import { HOOKSHOP_LABEL } from './hookshop.constants';
import { packInstalled } from './hooks/pack-installed';
import { packUninstalled } from './hooks/pack-uninstalled';
import { releasePack } from './hooks/release-pack';
import { hookshopInstallers } from './installers/hookshop-installers';
import { parseGrant } from './schema/parse-grant';
import { parseHome } from './schema/parse-home';
import { parseItem } from './schema/parse-item';
import { parsePage } from './schema/parse-page';

const maxBytes = ({ kind }: CatalogGrant): number => (isStoreKind(kind) ? STORE_LIMITS.packBytes[kind] : 0);

const hookshopConfig = (): CatalogConfig => ({
  label: HOOKSHOP_LABEL,
  endpoint: HOOKSHOP_ENDPOINT,
  schema: { item: parseItem, page: parsePage, home: parseHome, grant: parseGrant },
  installers: hookshopInstallers(),
  maxBytes,
  linkScheme: INSTALL_SCHEME,
  onRelease: releasePack,
  onInstalled: packInstalled,
  onUninstalled: packUninstalled,
});

export { hookshopConfig };
