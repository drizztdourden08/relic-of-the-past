/* @layer shared-store @kind logic */
import { z } from 'zod';

const mediaRoleSchema = z.enum(['card', 'banner']);

export { mediaRoleSchema };
