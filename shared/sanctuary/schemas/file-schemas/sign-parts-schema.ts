/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { LIMITS } from '../../limits';

const signPartsSchema = z.object({
  parts: z.array(z.number().int().positive()).min(1).max(LIMITS.partsPerSign),
  partsDone: z.number().int().nonnegative().optional(),
});

export { signPartsSchema };
