/* @layer shared-sanctuary @kind types */
import type { z } from 'zod';
import type { beginVersionSchema } from './begin-version-schema';
import type { completeFileSchema } from './complete-file-schema';
import type { createFileSchema } from './create-file-schema';
import type { patchFileSchema } from './patch-file-schema';
import type { signPartsSchema } from './sign-parts-schema';

type CreateFileBody = z.infer<typeof createFileSchema>;
type SignPartsBody = z.infer<typeof signPartsSchema>;
type CompleteFileBody = z.infer<typeof completeFileSchema>;
type PatchFileBody = z.infer<typeof patchFileSchema>;
type BeginVersionBody = z.infer<typeof beginVersionSchema>;

export type { CreateFileBody, SignPartsBody, CompleteFileBody, PatchFileBody, BeginVersionBody };
