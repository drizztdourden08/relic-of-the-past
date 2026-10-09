/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { MAX_CONTEXT_CHARS, MAX_SCREEN_ID_CHARS } from './report-schemas.constants';

const reportContextSchema = z.object({
  appVersion: z.string().trim().min(1).max(MAX_CONTEXT_CHARS),
  platform: z.string().trim().min(1).max(MAX_CONTEXT_CHARS),
  screenId: z.string().trim().min(1).max(MAX_SCREEN_ID_CHARS).nullable(),
});

export { reportContextSchema };
