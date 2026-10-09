/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { noteSchema } from '../field-schemas';

const adminRevokeSchema = z.object({
  note: noteSchema.default(''),
});

export { adminRevokeSchema };
