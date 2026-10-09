/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { LIMITS } from '../../limits';
import { reportContentsSchema } from './report-contents-schema';

const reportAttachmentSchema = z.object({
  bytes: z.number().int().positive().max(LIMITS.reportBytes),
  contents: reportContentsSchema,
});

export { reportAttachmentSchema };
