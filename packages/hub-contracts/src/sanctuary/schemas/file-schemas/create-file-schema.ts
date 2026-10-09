/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { noteSchema, tagsSchema, versionSchema } from '../../../hub/schemas/common';
import { LIMITS } from '../../limits';
import { MAX_CONTENT_TYPE_CHARS, MAX_NAME_CHARS, SHA256_PATTERN } from './file-schemas.constants';
import { fileTypeSchema } from './file-type-schema';

const createFileSchema = z.object({
  type: fileTypeSchema,
  tags: tagsSchema.default([]),
  version: versionSchema.default(null),
  name: z.string().trim().min(1).max(MAX_NAME_CHARS),
  bytes: z.number().int().positive().max(LIMITS.fileBytes),
  sha256: z.string().regex(SHA256_PATTERN, 'lowercase hex sha256').nullable().default(null),
  contentType: z.string().trim().min(1).max(MAX_CONTENT_TYPE_CHARS),
  note: noteSchema.default(''),
});

export { createFileSchema };
