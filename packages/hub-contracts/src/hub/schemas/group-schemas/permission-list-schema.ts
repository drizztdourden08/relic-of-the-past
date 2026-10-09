/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { MAX_PERMISSION_CHARS, PERMISSION_PATTERN } from './group-schemas.constants';

const permissionListSchema = z
  .array(z.string().max(MAX_PERMISSION_CHARS).regex(PERMISSION_PATTERN, 'a permission name'))
  .transform((permissions) => Array.from(new Set(permissions)));

export { permissionListSchema };
