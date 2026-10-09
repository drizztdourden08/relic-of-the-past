/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { DISCORD_SNOWFLAKE_PATTERN, MAX_GROUP_NAME_CHARS } from './group-schemas.constants';
import { groupRightsSchema } from './group-rights-schema';

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(MAX_GROUP_NAME_CHARS),
  discordRoleId: z.string().trim().regex(DISCORD_SNOWFLAKE_PATTERN, 'a Discord role id, digits only').nullable().default(null),
  rights: groupRightsSchema,
});

export { createGroupSchema };
