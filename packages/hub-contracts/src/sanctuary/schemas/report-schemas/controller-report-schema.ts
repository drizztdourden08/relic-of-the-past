/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';

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

export { controllerReportSchema };
