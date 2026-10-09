/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { noteSchema, tagsSchema, versionSchema } from '../../../hub/schemas/field-schemas';
import { fileTypeSchema } from './file-type-schema';

const patchFileSchema = z
  .object({
    type: fileTypeSchema,
    tags: tagsSchema,
    version: versionSchema,
    note: noteSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to change');

export { patchFileSchema };
