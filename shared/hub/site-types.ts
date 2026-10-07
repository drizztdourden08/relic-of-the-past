/* @layer shared-hub @kind types */
/**
 * The sites that stand on the shared accounts, and how each one lets a signed-in person
 * in. An approval site runs the access chain; an open site lets anyone signed in through.
 * What a person holds on one site is their SiteAccess record for that site.
 */
import type { AccessCheck, HubUser } from './types';

const SITE_IDS = ['sanctuary', 'store'] as const;

type SiteId = (typeof SITE_IDS)[number];

type AccessPolicy = 'approval' | 'open';

/** The access check as today, plus when the person first came to this site. */
type SiteAccess = AccessCheck & { firstSeenAt: number };

/**
 * A user as one site's API answers GET /me: the account plus that site's record under
 * `access`, null when the person never signed in to the site. A released app reads
 * `user.access`, so the field stays.
 */
type SiteUser = HubUser & { access: SiteAccess | null };

const isSiteId = (value: unknown): value is SiteId =>
  typeof value === 'string' && (SITE_IDS as readonly string[]).includes(value);

export { SITE_IDS, isSiteId };
export type { SiteId, AccessPolicy, SiteAccess, SiteUser };
