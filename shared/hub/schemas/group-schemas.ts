/* @layer shared-hub @kind logic */
/**
 * Request bodies for groups and memberships. A group's rights name permissions per site;
 * the shape is checked here, and each API checks its own site's names against its model.
 */
import { z } from 'zod';
import { SITE_IDS } from '../site-types';
import type { SiteId } from '../site-types';
import { idSchema } from './common';

const MAX_GROUP_NAME_CHARS = 40;
const MAX_PERMISSION_CHARS = 64;
const PERMISSION_PATTERN = /^[a-z][a-z0-9:-]*$/;
/** A Discord snowflake: digits only. */
const ROLE_ID_PATTERN = /^\d{5,25}$/;

const permissionListSchema = z
  .array(z.string().max(MAX_PERMISSION_CHARS).regex(PERMISSION_PATTERN, 'a permission name'))
  .transform((permissions) => Array.from(new Set(permissions)));

const siteShape = Object.fromEntries(SITE_IDS.map((site) => [site, permissionListSchema.optional()])) as Record<
  SiteId,
  z.ZodOptional<typeof permissionListSchema>
>;

/** One optional permission list per site; a site left out grants nothing there. */
const groupRightsSchema = z.object(siteShape).strict();

/** POST /groups */
const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(MAX_GROUP_NAME_CHARS),
  discordRoleId: z.string().trim().regex(ROLE_ID_PATTERN, 'a Discord role id, digits only').nullable().default(null),
  rights: groupRightsSchema,
});

/** PATCH /groups/:id */
const patchGroupSchema = createGroupSchema.partial().refine((body) => Object.keys(body).length > 0, 'nothing to change');

/** PUT /admin/users/:userId/groups: the person's manual groups, replacing the list. */
const setGroupsSchema = z.object({
  groupIds: z.array(idSchema).max(50).transform((ids) => Array.from(new Set(ids))),
});

type GroupRightsBody = z.infer<typeof groupRightsSchema>;
type CreateGroupBody = z.infer<typeof createGroupSchema>;
type PatchGroupBody = z.infer<typeof patchGroupSchema>;
type SetGroupsBody = z.infer<typeof setGroupsSchema>;

export { groupRightsSchema, createGroupSchema, patchGroupSchema, setGroupsSchema };
export type { GroupRightsBody, CreateGroupBody, PatchGroupBody, SetGroupsBody };
