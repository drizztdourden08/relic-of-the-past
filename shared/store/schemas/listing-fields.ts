/* @layer shared-store @kind logic */
import { z } from 'zod';
import { tagsSchema } from '../../hub/schemas/common';
import { ITEM_COLOR_PATTERN } from '../item-color';
import { MAX_DESCRIPTION_CHARS, MAX_LICENSE_CHARS, MAX_NAME_CHARS, MAX_SUMMARY_CHARS } from './schemas.constants';

const listingFields = {
  name: z.string().trim().min(1).max(MAX_NAME_CHARS),
  summary: z.string().trim().min(1).max(MAX_SUMMARY_CHARS),
  description: z.string().trim().max(MAX_DESCRIPTION_CHARS),
  tags: tagsSchema,
  license: z.string().trim().min(1).max(MAX_LICENSE_CHARS),
  color: z.string().regex(ITEM_COLOR_PATTERN, 'a colour as #rrggbb'),
};

export { listingFields };
