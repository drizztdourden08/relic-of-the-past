/* @layer hub-core @kind logic */
/** The provider callback URL of one site, fixed by its Hosting rewrite: /api/auth/<provider>/callback. */
import type { SiteConfig } from '../site-config.type';

const callbackUrlFor = (site: SiteConfig, provider: string): string => `${site.origin()}/api/auth/${provider}/callback`;

export { callbackUrlFor };
