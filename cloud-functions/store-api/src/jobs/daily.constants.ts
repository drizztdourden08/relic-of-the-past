/* @layer store-api @kind constants */
import type { Actor } from '@rotp/hub-contracts';
import { DAY_MS } from '../db/daily-repo.constants';

const STALE_UPLOAD_MS = 2 * DAY_MS;
const WAITING_WARNING_DAYS = 7;
const JOB_ACTORS: readonly Actor[] = ['author', 'reviewer'];

export { STALE_UPLOAD_MS, WAITING_WARNING_DAYS, JOB_ACTORS };
