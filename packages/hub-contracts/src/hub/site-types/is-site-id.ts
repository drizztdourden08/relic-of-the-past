/* @layer shared-hub @kind logic */
import { SITE_IDS } from './site-types.constants';
import type { SiteId } from './site-types.type';

const isSiteId = (value: unknown): value is SiteId =>
  typeof value === 'string' && (SITE_IDS as readonly string[]).includes(value);

export { isSiteId };
