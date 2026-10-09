/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { MAX_VERSION_CHARS } from './field-schemas.constants';

const versionSchema = z.string().trim().min(1).max(MAX_VERSION_CHARS).nullable();

export { versionSchema };
