/* @layer shared-store @kind logic */
import { z } from 'zod';
import { STORE_LIMITS } from '../limits';
import { mediaRoleSchema } from './media-role-schema';
import { sha256Schema } from './sha256-schema';

const mediaUploadSchema = z
  .object({ role: mediaRoleSchema, bytes: z.number().int().positive(), sha256: sha256Schema })
  .refine((body) => body.bytes <= STORE_LIMITS[body.role].bytes, { message: 'the picture is too large', path: ['bytes'] });

export { mediaUploadSchema };
