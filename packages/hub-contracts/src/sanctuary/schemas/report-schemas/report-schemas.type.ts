/* @layer shared-sanctuary @kind types */
import type { z } from 'zod';
import type { extendReportSchema } from './extend-report-schema';
import type { submitReportSchema } from './submit-report-schema';

type SubmitReportBody = z.infer<typeof submitReportSchema>;
type ExtendReportBody = z.infer<typeof extendReportSchema>;

export type { SubmitReportBody, ExtendReportBody };
