/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';

const completeFileSchema = z.object({
  etags: z.array(z.string().min(1)).min(1),
});

export { completeFileSchema };
