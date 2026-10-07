/* @layer shared-hub @kind types */
/**
 * Groups decide what a signed-in person can do. A group names, per site, the permissions
 * its members hold; a person's rights on a site are the union of their groups' permissions
 * for that site. A group can be linked to a Discord role, which puts everyone holding the
 * role in it, and an admin can also add people by hand.
 */
import type { SiteId } from './site-types';

/** Permission names per site, as each site's RightsModel spells them. */
type GroupRights = Partial<Record<SiteId, string[]>>;

type Group = {
  id: string;
  name: string;
  /** Everyone holding this Discord role is in the group, refreshed at sign-in and re-check. */
  discordRoleId: string | null;
  rights: GroupRights;
  createdAt: number;
};

/** What one caller may do on one site: the union of their groups, or everything for an admin. */
type Rights = {
  site: SiteId;
  permissions: string[];
  admin: boolean;
};

/** One role of the Discord server, as the group editor offers it. */
type DiscordRole = {
  id: string;
  name: string;
  /** RGB as a number, 0 when the role has no colour. */
  color: number;
  /** Discord's own order, highest first when sorted descending. */
  position: number;
};

/** Seeded from today's contributor role and sees everything, so nobody loses access. */
const DEFAULT_GROUP_ID = 'contributors';

export { DEFAULT_GROUP_ID };
export type { GroupRights, Group, Rights, DiscordRole };
