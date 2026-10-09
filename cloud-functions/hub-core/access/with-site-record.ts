/* @layer hub-core @kind logic */
import type { HubUser } from '../../../shared/hub';
import type { SiteConfig } from '../site-config.type';
import { refreshAccess } from './refresh-access';

const withSiteRecord = async (site: SiteConfig, user: HubUser): Promise<HubUser> => {
  if (site.access !== 'open' || user.sites[site.id]) return user;
  return refreshAccess(site, user.id, null);
};

export { withSiteRecord };
