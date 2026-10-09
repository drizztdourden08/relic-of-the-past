/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';

const reportContentsSchema = z.object({
  saves: z.number().int().nonnegative(),
  captureSessions: z.number().int().nonnegative(),
  logs: z.number().int().nonnegative(),
});

export { reportContentsSchema };
