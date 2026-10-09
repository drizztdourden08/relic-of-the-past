/* @layer hub-core @kind logic */
import type { HubUser, SiteUser } from '../../../shared/hub';
import type { SiteConfig } from '../site-config.type';

const siteUserOf = (user: HubUser, site: SiteConfig): SiteUser => ({ ...user, access: user.sites[site.id] ?? null });

export { siteUserOf };
