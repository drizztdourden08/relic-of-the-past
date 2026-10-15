/* @layer shared-hub @kind types */
import type { z } from 'zod';
import type { createGroupSchema } from './create-group-schema';
import type { patchGroupSchema } from './patch-group-schema';

type CreateGroupBody = z.infer<typeof createGroupSchema>;
type PatchGroupBody = z.infer<typeof patchGroupSchema>;

export type { CreateGroupBody, PatchGroupBody };
