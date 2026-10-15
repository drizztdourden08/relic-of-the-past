/* @layer shared-hub @kind types */
import type { z } from 'zod';
import type { putViewSchema } from './put-view-schema';

type PutViewBody = z.infer<typeof putViewSchema>;

export type { PutViewBody };
