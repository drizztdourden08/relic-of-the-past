/* @layer sanctuary-site @kind constants */
import { LIMITS } from '@rotp/hub-contracts';
import { formatBytes } from '@rotp/hub-client';

const DROP_HINT = `Up to ${formatBytes(LIMITS.fileBytes)} each, stored exactly as sent.`;

export { DROP_HINT };
