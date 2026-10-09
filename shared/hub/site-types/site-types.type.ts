/* @layer shared-hub @kind types */
import type { AccessCheck, HubUser } from '../types';
import type { SITE_IDS } from './site-types.constants';

type SiteId = (typeof SITE_IDS)[number];

type AccessPolicy = 'approval' | 'open';

type SiteAccess = AccessCheck & { firstSeenAt: number };

type SiteUser = HubUser & { access: SiteAccess | null };

export type { SiteId, AccessPolicy, SiteAccess, SiteUser };
