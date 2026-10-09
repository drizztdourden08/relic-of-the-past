/* @layer shared-store @kind logic */
import { z } from 'zod';
import { DEFAULT_ITEM_COLOR } from '../item-color';
import { kindSchema } from './kind-schema';
import { listingFields } from './listing-fields';

const itemCreateSchema = z.object({
  kind: kindSchema,
  ...listingFields,
  description: listingFields.description.default(''),
  tags: listingFields.tags.default([]),
  color: listingFields.color.default(DEFAULT_ITEM_COLOR),
});

export { itemCreateSchema };
