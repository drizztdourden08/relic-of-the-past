/* @layer hub-core @kind logic */
import type { SiteConfig } from '../site-config.type';

const callbackUrlFor = (site: SiteConfig, provider: string): string => `${site.origin()}/api/auth/${provider}/callback`;

export { callbackUrlFor };
