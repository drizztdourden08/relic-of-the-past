/* @layer shared-store @kind logic */
import { z } from 'zod';
import { containerSchema } from './container-schema';
import { LARGEST_PACK, MAX_CHANGELOG_CHARS } from './schemas.constants';
import { sha256Schema } from './sha256-schema';

const versionBeginSchema = z.object({
  changelog: z.string().trim().max(MAX_CHANGELOG_CHARS).default(''),
  container: containerSchema,
  bytes: z.number().int().positive().max(LARGEST_PACK),
  sha256: sha256Schema,
});

export { versionBeginSchema };
