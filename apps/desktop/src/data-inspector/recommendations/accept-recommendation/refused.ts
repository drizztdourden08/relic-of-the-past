/* @layer renderer-app @kind logic */
import type { AcceptRefused } from '../recommendations.type';

const refused = (error: string): AcceptRefused => ({ success: false, reason: 'failed', error });

export { refused };
