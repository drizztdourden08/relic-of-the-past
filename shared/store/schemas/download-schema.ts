/* @layer shared-store @kind logic */
import { z } from 'zod';

const downloadSchema = z.object({
  version: z.number().int().positive().optional(),
});

export { downloadSchema };
