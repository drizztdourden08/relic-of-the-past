/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { MAX_SURFACE_CHARS, SURFACE_PATTERN } from './account-schemas.constants';

const viewSurfaceSchema = z.string().trim().min(1).max(MAX_SURFACE_CHARS).regex(SURFACE_PATTERN, 'a surface name');

export { viewSurfaceSchema };
