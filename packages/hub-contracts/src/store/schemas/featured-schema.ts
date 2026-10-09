/* @layer shared-store @kind logic */
import { z } from 'zod';
import { idSchema } from '../../hub/schemas/common';
import { STORE_LIMITS } from '../limits';

const featuredSchema = z.object({
  itemIds: z
    .array(idSchema)
    .max(STORE_LIMITS.featuredMax)
    .refine((ids) => new Set(ids).size === ids.length, 'an item appears twice'),
});

export { featuredSchema };
