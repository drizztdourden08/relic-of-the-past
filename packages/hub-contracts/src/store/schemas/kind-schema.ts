/* @layer shared-store @kind logic */
import { z } from 'zod';

const kindSchema = z.enum(['music', 'character', 'language']);

export { kindSchema };
