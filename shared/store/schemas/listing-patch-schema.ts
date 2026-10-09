/* @layer shared-store @kind logic */
import { z } from 'zod';
import { listingFields } from './listing-fields';
import { mediaRefSchema } from './media-ref-schema';

const listingPatchSchema = z
  .object({ ...listingFields, card: mediaRefSchema.nullable(), banner: mediaRefSchema.nullable() })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to change');

export { listingPatchSchema };
