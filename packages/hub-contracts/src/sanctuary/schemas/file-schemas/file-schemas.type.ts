/* @layer shared-sanctuary @kind types */
import type { z } from 'zod';
import type { beginVersionSchema } from './begin-version-schema';
import type { createFileSchema } from './create-file-schema';
import type { patchFileSchema } from './patch-file-schema';

type CreateFileBody = z.infer<typeof createFileSchema>;
type PatchFileBody = z.infer<typeof patchFileSchema>;
type BeginVersionBody = z.infer<typeof beginVersionSchema>;

export type { CreateFileBody, PatchFileBody, BeginVersionBody };
