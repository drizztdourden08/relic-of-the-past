/* @layer hub-core @kind logic */
/** An open site holds a record for everyone who calls it. A caller who reaches it without
 *  signing in there (a device token confirmed on another site, or a session older than the
 *  site) gets that record written on their first call. An approval site never writes one
 *  here: its record comes from its own sign-in and its own chain. */
import type { HubUser } from '../../../shared/hub';
import type { SiteConfig } from '../site-config.type';
import { refreshAccess } from './refresh-access';

const withSiteRecord = async (site: SiteConfig, user: HubUser): Promise<HubUser> => {
  if (site.access !== 'open' || user.sites[site.id]) return user;
  return refreshAccess(site, user.id, null);
};

export { withSiteRecord };
