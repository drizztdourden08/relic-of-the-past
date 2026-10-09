/* @layer hub-core @kind constants */
import { HUB_LIMITS } from '../../../../shared/hub';

const TTL_SECONDS = HUB_LIMITS.sessionDays * 24 * 60 * 60;

export { TTL_SECONDS };
