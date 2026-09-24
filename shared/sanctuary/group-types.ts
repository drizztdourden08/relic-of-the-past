/* @layer shared-sanctuary @kind types */
/**
 * Groups decide what a signed-in person can see. A group names the file types (and
 * whether the reports) its members see and upload to; a person's rights are the union of
 * their groups. A group can be linked to a Discord role, which puts everyone holding the
 * role in it, and an admin can also add people by hand.
 */
import type { FileType } from './file-types';

type GroupRights = {
  /** The shelves this group sees and uploads to. */
  fileTypes: FileType[];
  /** The Reports page. Filing a report from the app is never gated. */
  reports: boolean;
};

type Group = {
  id: string;
  name: string;
  /** Everyone holding this Discord role is in the group, refreshed at sign-in and re-check. */
  discordRoleId: string | null;
  rights: GroupRights;
  createdAt: number;
};

/** What one caller may see: the union of their groups, or everything for an admin. */
type Rights = GroupRights & { admin: boolean };

/** Seeded from today's contributor role and sees everything, so nobody loses access. */
const DEFAULT_GROUP_ID = 'contributors';

export { DEFAULT_GROUP_ID };
export type { GroupRights, Group, Rights };
