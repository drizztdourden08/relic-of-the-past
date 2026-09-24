/* @layer shared-sanctuary @kind logic */
/**
 * Request bodies of the report routes. submitReportSchema mirrors SubmitReportRequest field
 * for field; the controller payload keeps the shape of ControllerReportPayload.
 */
import { z } from 'zod';
import { LIMITS } from '../limits';

const MAX_SUBJECT_CHARS = 120;
const MAX_DESCRIPTION_CHARS = 5000;
const MAX_DEBUG_INFO_CHARS = 20000;
const MAX_CONTEXT_CHARS = 120;
const MAX_SCREEN_ID_CHARS = 64;

const reportKindSchema = z.enum(['player', 'controller']);

const reportContentsSchema = z.object({
  saves: z.number().int().nonnegative(),
  captureSessions: z.number().int().nonnegative(),
  logs: z.number().int().nonnegative(),
});

const reportAttachmentSchema = z.object({
  bytes: z.number().int().positive().max(LIMITS.reportBytes),
  contents: reportContentsSchema,
});

const reportContextSchema = z.object({
  appVersion: z.string().trim().min(1).max(MAX_CONTEXT_CHARS),
  platform: z.string().trim().min(1).max(MAX_CONTEXT_CHARS),
  screenId: z.string().trim().min(1).max(MAX_SCREEN_ID_CHARS).nullable(),
});

/** Mirrors ControllerReportPayload; every field is preformatted text from the app. */
const controllerReportSchema = z.object({
  detectedName: z.string(),
  sdlMatch: z.string().nullable(),
  inputApi: z.string(),
  vendorId: z.string(),
  productId: z.string(),
  hidReport: z.string(),
  calibrationMap: z.string(),
  positionalCapture: z.string().optional(),
  diagnosticsReport: z.string().optional(),
});

/** POST /reports */
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

/** POST /reports/:id/extend carries no fields; the id is in the path. */
const extendReportSchema = z.object({}).strict();

type SubmitReportBody = z.infer<typeof submitReportSchema>;
type ExtendReportBody = z.infer<typeof extendReportSchema>;

export {
  reportKindSchema,
  reportContentsSchema,
  reportAttachmentSchema,
  reportContextSchema,
  controllerReportSchema,
  submitReportSchema,
  extendReportSchema,
};
export type { SubmitReportBody, ExtendReportBody };
