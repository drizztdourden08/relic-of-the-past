/* @layer shared-sanctuary @kind logic */
/**
 * Field schemas several request bodies share: the free tag list, the one-line note and the
 * app version string. Each request schema composes these, so a cap is stated once.
 */
import { z } from 'zod';
import { LIMITS } from '../limits';

const TAG_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MAX_TAGS = 12;
const MAX_TAG_CHARS = 32;
const MAX_VERSION_CHARS = 40;

/** Free tags: lowercase, no spaces, at most MAX_TAGS, deduplicated. */
const tagsSchema = z
  .array(z.string().min(1).max(MAX_TAG_CHARS).regex(TAG_PATTERN, 'lowercase letters, digits, dots, dashes'))
  .max(MAX_TAGS)
  .transform((tags) => Array.from(new Set(tags)));

/** One line, at most LIMITS.noteMaxChars, trimmed. */
const noteSchema = z.string().trim().max(LIMITS.noteMaxChars);

/** App version the record relates to, or null when it relates to none. */
const versionSchema = z.string().trim().min(1).max(MAX_VERSION_CHARS).nullable();

/** Firestore doc ids and multipart ids: short, printable, no slashes. */
const idSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);

export { tagsSchema, noteSchema, versionSchema, idSchema, MAX_TAGS };
