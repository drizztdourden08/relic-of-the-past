/* @layer shared-sanctuary @kind data */
/**
 * Every size, count and lifetime the Sanctuary site, its API and the app agree on: the
 * shared account limits plus the caps on files and reports. One table so a cap raised on
 * the server is raised in the upload loop and the schemas on the same commit.
 */
import { HUB_LIMITS } from '../hub/limits';

const MiB = 1024 * 1024;

const LIMITS = {
  ...HUB_LIMITS,
  /** Largest shared file, in bytes. */
  fileBytes: 2 * 1024 * MiB,
  /** Largest report zip, in bytes. */
  reportBytes: 50 * MiB,
  /** Days one Extend click adds to a report. */
  extendDays: 30,
  /** Furthest a report can be extended past its issue's close. */
  extendMaxDays: 365,
  /** Anonymous reports accepted from one IP in a ten-minute window. */
  anonymousReportsPer10Min: 3,
} as const;

type Limits = typeof LIMITS;

export { LIMITS };
export type { Limits };
