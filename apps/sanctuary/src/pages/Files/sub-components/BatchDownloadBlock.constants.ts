/* @layer sanctuary-site @kind constants */
import { formatBytes } from '@site-kit/lib/format-bytes';
import { BATCH_ZIP_MAX_BYTES } from '../Files.constants';

const OVER_LIMIT_NOTE = `Over ${formatBytes(BATCH_ZIP_MAX_BYTES)} in all, so each file downloads on its own. `
  + 'The browser may ask to allow several downloads.';

export { OVER_LIMIT_NOTE };
