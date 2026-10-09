/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { MAX_VIEW_NAME_CHARS } from './account-schemas.constants';
import { viewSurfaceSchema } from './view-surface-schema';

const putViewSchema = z.object({
  surface: viewSurfaceSchema,
  name: z.string().trim().min(1).max(MAX_VIEW_NAME_CHARS),
  snapshot: z.unknown(),
});

export { putViewSchema };
