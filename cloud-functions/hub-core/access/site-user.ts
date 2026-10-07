/* @layer hub-core @kind logic */
/** A user as this site answers it: the account with the site's own record lifted to
 *  `access`, so a page reads one field whichever site it is on. */
import type { HubUser, SiteUser } from '../../../shared/hub';
import type { SiteConfig } from '../site-config.type';

const siteUserOf = (user: HubUser, site: SiteConfig): SiteUser => ({ ...user, access: user.sites[site.id] ?? null });

export { siteUserOf };
