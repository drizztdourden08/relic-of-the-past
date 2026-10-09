/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { controllerReportSchema } from './controller-report-schema';
import { reportAttachmentSchema } from './report-attachment-schema';
import { reportContextSchema } from './report-context-schema';
import { reportKindSchema } from './report-kind-schema';
import { MAX_DEBUG_INFO_CHARS, MAX_DESCRIPTION_CHARS, MAX_SUBJECT_CHARS } from './report-schemas.constants';

const submitReportSchema = z.object({
  kind: reportKindSchema,
  subject: z.string().trim().min(1).max(MAX_SUBJECT_CHARS),
  description: z.string().trim().min(1).max(MAX_DESCRIPTION_CHARS),
  debugInfo: z.string().max(MAX_DEBUG_INFO_CHARS),
  context: reportContextSchema,
  contactEmail: z.string().trim().email().nullable(),
  attachment: reportAttachmentSchema.nullable(),
  controllerReport: controllerReportSchema.optional(),
});

export { submitReportSchema };
