/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { MAX_TAG_CHARS, MAX_TAGS, TAG_PATTERN } from './field-schemas.constants';

const tagsSchema = z
  .array(z.string().min(1).max(MAX_TAG_CHARS).regex(TAG_PATTERN, 'lowercase letters, digits, dots, dashes'))
  .max(MAX_TAGS)
  .transform((tags) => Array.from(new Set(tags)));

export { tagsSchema };
