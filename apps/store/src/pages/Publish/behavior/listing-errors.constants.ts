/* @layer store-site @kind constants */
import { tagsSchema } from '@rotp/hub-contracts';
import { itemCreateSchema } from '@rotp/hub-contracts';

const { shape } = itemCreateSchema;
const TAG_SCHEMA = tagsSchema.innerType().element;

const LISTING_CAPS = {
  name: shape.name.maxLength ?? 0,
  summary: shape.summary.maxLength ?? 0,
  description: shape.description.removeDefault().maxLength ?? 0,
  license: shape.license.maxLength ?? 0,
  tag: TAG_SCHEMA.maxLength ?? 0,
};

export { LISTING_CAPS, TAG_SCHEMA };
