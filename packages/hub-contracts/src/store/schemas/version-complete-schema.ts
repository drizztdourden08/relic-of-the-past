/* @layer shared-store @kind logic */
import { z } from 'zod';

const versionCompleteSchema = z.object({
  etags: z.array(z.string().min(1)).min(1),
});

export { versionCompleteSchema };
