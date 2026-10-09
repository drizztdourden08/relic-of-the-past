/* @layer sanctuary-site @kind constants */
import { LIMITS } from '@shared/sanctuary/limits';
import { formatBytes } from '@site-kit/lib/format-bytes';

const DROP_HINT = `Up to ${formatBytes(LIMITS.fileBytes)} each, stored exactly as sent.`;

export { DROP_HINT };
