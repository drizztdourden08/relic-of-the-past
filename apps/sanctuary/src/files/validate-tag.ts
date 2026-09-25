/* @layer sanctuary-site @kind logic */
/** The TagInput check for a file tag: the API's own tag rule, with the hint shown when it fails. */
import { tagsSchema } from '@shared/sanctuary/schemas/common';

const TAG_HINT = 'lowercase letters, digits, dots, dashes';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

export { validateTag };
