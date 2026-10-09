/* @layer sanctuary-site @kind logic */
import { tagsSchema } from '@shared/hub/schemas/common';
import { TAG_HINT } from './validate-tag.constants';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

export { validateTag };
