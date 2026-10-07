/* @layer shared-sanctuary @kind logic */
/**
 * Request bodies of the file routes: create, sign parts, complete, patch and a new version.
 * Sizes and counts come from LIMITS so the API rejects what the upload loop would never send.
 * A version upload declares the same facts as a new file (name, size, hash, content type)
 * plus what changed.
 */
import { z } from 'zod';
import { FILE_TYPES } from '../file-types';
import { LIMITS } from '../limits';
import { noteSchema, tagsSchema, versionSchema } from '../../hub/schemas/common';

const MAX_NAME_CHARS = 255;
const MAX_CONTENT_TYPE_CHARS = 255;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MAX_VERSION_NAME_CHARS = 200;
const MAX_VERSION_CONTENT_TYPE_CHARS = 120;

const fileTypeSchema = z.enum(FILE_TYPES);

/** POST /files */
const createFileSchema = z.object({
  type: fileTypeSchema,
  tags: tagsSchema.default([]),
  version: versionSchema.default(null),
  name: z.string().trim().min(1).max(MAX_NAME_CHARS),
  bytes: z.number().int().positive().max(LIMITS.fileBytes),
  sha256: z.string().regex(SHA256_PATTERN, 'lowercase hex sha256').nullable().default(null),
  contentType: z.string().trim().min(1).max(MAX_CONTENT_TYPE_CHARS),
  note: noteSchema.default(''),
});

/** POST /files/:id/parts and /files/:id/versions/:n/parts. `partsDone` is how many parts the uploader already has up. */
const signPartsSchema = z.object({
  parts: z.array(z.number().int().positive()).min(1).max(LIMITS.partsPerSign),
  partsDone: z.number().int().nonnegative().optional(),
});

/** POST /files/:id/complete */
const completeFileSchema = z.object({
  etags: z.array(z.string().min(1)).min(1),
});

/** PATCH /files/:id, every field optional, at least one present. */
const patchFileSchema = z
  .object({
    type: fileTypeSchema,
    tags: tagsSchema,
    version: versionSchema,
    note: noteSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to change');

/** POST /files/:id/versions */
const beginVersionSchema = z.object({
  name: z.string().trim().min(1).max(MAX_VERSION_NAME_CHARS),
  bytes: z.number().int().positive().max(LIMITS.fileBytes),
  sha256: z.string().regex(SHA256_PATTERN, 'lowercase hex sha256').nullable().default(null),
  contentType: z.string().trim().min(1).max(MAX_VERSION_CONTENT_TYPE_CHARS),
  note: noteSchema.default(''),
});

type CreateFileBody = z.infer<typeof createFileSchema>;
type SignPartsBody = z.infer<typeof signPartsSchema>;
type CompleteFileBody = z.infer<typeof completeFileSchema>;
type PatchFileBody = z.infer<typeof patchFileSchema>;
type BeginVersionBody = z.infer<typeof beginVersionSchema>;

export { fileTypeSchema, createFileSchema, signPartsSchema, completeFileSchema, patchFileSchema, beginVersionSchema };
export type { CreateFileBody, SignPartsBody, CompleteFileBody, PatchFileBody, BeginVersionBody };
