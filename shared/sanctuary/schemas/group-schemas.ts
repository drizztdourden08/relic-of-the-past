/* @layer shared-sanctuary @kind logic */
/**
 * Request bodies for groups, memberships and file versions. A version upload declares
 * the same facts as a new file (name, size, hash, content type) plus what changed.
 */
import { z } from 'zod';
import { FILE_TYPES } from '../file-types';
import { LIMITS } from '../limits';
import { idSchema, noteSchema } from './common';

const MAX_GROUP_NAME_CHARS = 40;
const MAX_FILE_NAME_CHARS = 200;
const MAX_CONTENT_TYPE_CHARS = 120;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
/** A Discord snowflake: digits only. */
const ROLE_ID_PATTERN = /^\d{5,25}$/;

const groupRightsSchema = z.object({
  fileTypes: z.array(z.enum(FILE_TYPES)).transform((types) => Array.from(new Set(types))),
  reports: z.boolean(),
});

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

/** POST /files/:id/versions */
const beginVersionSchema = z.object({
  name: z.string().trim().min(1).max(MAX_FILE_NAME_CHARS),
  bytes: z.number().int().positive().max(LIMITS.fileBytes),
  sha256: z.string().regex(SHA256_PATTERN, 'lowercase hex sha256').nullable().default(null),
  contentType: z.string().trim().min(1).max(MAX_CONTENT_TYPE_CHARS),
  note: noteSchema.default(''),
});

type GroupRightsBody = z.infer<typeof groupRightsSchema>;
type CreateGroupBody = z.infer<typeof createGroupSchema>;
type PatchGroupBody = z.infer<typeof patchGroupSchema>;
type SetGroupsBody = z.infer<typeof setGroupsSchema>;
type BeginVersionBody = z.infer<typeof beginVersionSchema>;

export { groupRightsSchema, createGroupSchema, patchGroupSchema, setGroupsSchema, beginVersionSchema };
export type { GroupRightsBody, CreateGroupBody, PatchGroupBody, SetGroupsBody, BeginVersionBody };
