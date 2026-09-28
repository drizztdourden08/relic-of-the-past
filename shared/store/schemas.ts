/* @layer shared-store @kind logic */
/**
 * Request bodies of the store's routes, one schema per POST, PUT or PATCH in STORE_ROUTES.
 * store-api parses every body through these and the site can check a form with the same
 * schema before sending it. Caps come from STORE_LIMITS and HUB_LIMITS, so the API refuses
 * what the forms would never send.
 */
import { z } from 'zod';
import { HUB_LIMITS } from '../hub/limits';
import { idSchema, tagsSchema } from '../hub/schemas/common';
import { DEFAULT_ITEM_COLOR, ITEM_COLOR_PATTERN } from './item-color';
import { STORE_LIMITS } from './limits';

const MAX_NAME_CHARS = 60;
const MAX_SUMMARY_CHARS = 140;
const MAX_DESCRIPTION_CHARS = 8000;
const MAX_LICENSE_CHARS = 60;
const MAX_CHANGELOG_CHARS = 2000;
const MAX_REVIEW_NOTE_CHARS = 1000;
const MAX_WELCOME_CHARS = 4000;
const MAX_FEATURED = 12;
const LARGEST_PACK = Math.max(...Object.values(STORE_LIMITS.packBytes));

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MEDIA_KEY_PATTERN = /^media\/[A-Za-z0-9_-]{1,128}\/(card|banner)-[a-f0-9]{8}\.webp$/;

const kindSchema = z.enum(['music', 'character', 'language']);
const containerSchema = z.enum(['msul', 'rsp', 'rlang']);
const sha256Schema = z.string().regex(SHA256_PATTERN, 'lowercase hex sha256');
const mediaRoleSchema = z.enum(['card', 'banner']);

const listingFields = {
  name: z.string().trim().min(1).max(MAX_NAME_CHARS),
  summary: z.string().trim().min(1).max(MAX_SUMMARY_CHARS),
  description: z.string().trim().max(MAX_DESCRIPTION_CHARS),
  tags: tagsSchema,
  license: z.string().trim().min(1).max(MAX_LICENSE_CHARS),
  color: z.string().regex(ITEM_COLOR_PATTERN, 'a colour as #rrggbb'),
};

/** A picture the author uploaded through POST /items/:id/media; the API checks it is there. */
const mediaRefSchema = z.object({
  key: z.string().regex(MEDIA_KEY_PATTERN, 'a key from the media upload'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** POST /items */
const itemCreateSchema = z.object({
  kind: kindSchema,
  ...listingFields,
  description: listingFields.description.default(''),
  tags: listingFields.tags.default([]),
  color: listingFields.color.default(DEFAULT_ITEM_COLOR),
});

/** POST /items/:id/media, the size held to the cap of the picture's role. */
const mediaUploadSchema = z
  .object({ role: mediaRoleSchema, bytes: z.number().int().positive(), sha256: sha256Schema })
  .refine((body) => body.bytes <= STORE_LIMITS[body.role].bytes, { message: 'the picture is too large', path: ['bytes'] });

/** POST /items/:id/listing, every field optional, at least one present. */
const listingPatchSchema = z
  .object({ ...listingFields, card: mediaRefSchema.nullable(), banner: mediaRefSchema.nullable() })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to change');

/** POST /items/:id/versions. The size is held to the item's kind by the API, which also numbers the version. */
const versionBeginSchema = z.object({
  changelog: z.string().trim().max(MAX_CHANGELOG_CHARS).default(''),
  container: containerSchema,
  bytes: z.number().int().positive().max(LARGEST_PACK),
  sha256: sha256Schema,
});

/** POST /items/:id/versions/:n/parts. `partsDone` is how many parts the uploader already has up. */
const signPartsSchema = z.object({
  parts: z.array(z.number().int().positive()).min(1).max(HUB_LIMITS.partsPerSign),
  partsDone: z.number().int().nonnegative().optional(),
});

/** POST /items/:id/versions/:n/complete */
const versionCompleteSchema = z.object({
  etags: z.array(z.string().min(1)).min(1),
});

/** POST /items/:id/download; no version means the live one. */
const downloadSchema = z.object({
  version: z.number().int().positive().optional(),
});

/** PUT /items/:id/rating */
const ratingSchema = z.object({
  stars: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

/** POST /review/:itemId/:target. A rejection says why. */
const reviewDecideSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    note: z.string().trim().max(MAX_REVIEW_NOTE_CHARS).default(''),
  })
  .refine((body) => body.decision === 'approve' || body.note.length > 0, {
    message: 'a rejection needs a note for the author',
    path: ['note'],
  });

/** PUT /home/featured: the featured row, first to last. */
const featuredSchema = z.object({
  itemIds: z
    .array(idSchema)
    .max(MAX_FEATURED)
    .refine((ids) => new Set(ids).size === ids.length, 'an item appears twice'),
});

/** PUT /home/welcome, markdown. */
const welcomeSchema = z.object({
  welcome: z.string().trim().max(MAX_WELCOME_CHARS),
});

type ItemCreateBody = z.infer<typeof itemCreateSchema>;
type MediaUploadBody = z.infer<typeof mediaUploadSchema>;
type ListingPatchBody = z.infer<typeof listingPatchSchema>;
type VersionBeginBody = z.infer<typeof versionBeginSchema>;
type SignPartsBody = z.infer<typeof signPartsSchema>;
type VersionCompleteBody = z.infer<typeof versionCompleteSchema>;
type DownloadBody = z.infer<typeof downloadSchema>;
type RatingBody = z.infer<typeof ratingSchema>;
type ReviewDecideBody = z.infer<typeof reviewDecideSchema>;
type FeaturedBody = z.infer<typeof featuredSchema>;
type WelcomeBody = z.infer<typeof welcomeSchema>;

export {
  kindSchema,
  containerSchema,
  mediaRefSchema,
  itemCreateSchema,
  mediaUploadSchema,
  listingPatchSchema,
  versionBeginSchema,
  signPartsSchema,
  versionCompleteSchema,
  downloadSchema,
  ratingSchema,
  reviewDecideSchema,
  featuredSchema,
  welcomeSchema,
};
export type {
  ItemCreateBody,
  MediaUploadBody,
  ListingPatchBody,
  VersionBeginBody,
  SignPartsBody,
  VersionCompleteBody,
  DownloadBody,
  RatingBody,
  ReviewDecideBody,
  FeaturedBody,
  WelcomeBody,
};
