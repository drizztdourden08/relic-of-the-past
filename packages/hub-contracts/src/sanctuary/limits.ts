/* @layer shared-sanctuary @kind data */
import { HUB_LIMITS } from '../hub/limits';

const MiB = 1024 * 1024;

const LIMITS = {
  ...HUB_LIMITS,
  fileBytes: 2 * 1024 * MiB,
  reportBytes: 50 * MiB,
  extendDays: 30,
  extendMaxDays: 365,
  anonymousReportsPer10Min: 3,
} as const;

export { LIMITS };
