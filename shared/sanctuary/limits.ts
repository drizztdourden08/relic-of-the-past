/* @layer shared-sanctuary @kind data */
/**
 * Every size, count and lifetime the site, the API and the app agree on. One table so a cap
 * raised on the server is raised in the upload loop and the schemas on the same commit.
 */
const MiB = 1024 * 1024;
const MINUTE_MS = 60 * 1000;

const LIMITS = {
  /** Largest shared file, in bytes. */
  fileBytes: 2 * 1024 * MiB,
  /** Size of one multipart part, in bytes. */
  partBytes: 64 * MiB,
  /** Part URLs signed per request. */
  partsPerSign: 8,
  /** Lifetime of a presigned part PUT. */
  partUrlSeconds: 3600,
  /** Lifetime of a presigned download GET. */
  /** Long enough to watch a video through without the link lapsing. */
  previewUrlSeconds: 60 * 60 * 2,
  downloadUrlSeconds: 600,
  /** Largest report zip, in bytes. */
  reportBytes: 50 * MiB,
  /** Length of a file or grant note. */
  noteMaxChars: 200,
  /** How long a device user code stays valid. */
  deviceCodeTtlMs: 10 * MINUTE_MS,
  /** Interval between two device polls from the app. */
  devicePollMs: 3000,
  /** Session cookie lifetime. */
  sessionDays: 30,
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
