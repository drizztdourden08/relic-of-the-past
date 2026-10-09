/* @layer shared-store @kind logic */
import { z } from 'zod';
import { HUB_LIMITS } from '../../hub/limits';

const signPartsSchema = z.object({
  parts: z.array(z.number().int().positive()).min(1).max(HUB_LIMITS.partsPerSign),
  partsDone: z.number().int().nonnegative().optional(),
});

export { signPartsSchema };
