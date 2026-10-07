/* @layer shared-hub @kind data */
/**
 * The sizes, counts and lifetimes every site, its API and the app agree on: multipart
 * parts, signed URL lifetimes, sessions and device codes. A site adds its own caps on top
 * in its own limits table.
 */
const MiB = 1024 * 1024;
const MINUTE_MS = 60 * 1000;

const HUB_LIMITS = {
  /** Size of one multipart part, in bytes. */
  partBytes: 64 * MiB,
  /** Part URLs signed per request. */
  partsPerSign: 8,
  /** Lifetime of a presigned part PUT. */
  partUrlSeconds: 3600,
  /** Lifetime of a presigned view link. Long enough to watch a video through without the link lapsing. */
  previewUrlSeconds: 60 * 60 * 2,
  /** Lifetime of a presigned download GET. */
  downloadUrlSeconds: 600,
  /** Length of a file or grant note. */
  noteMaxChars: 200,
  /** How long a device user code stays valid. */
  deviceCodeTtlMs: 10 * MINUTE_MS,
  /** Interval between two device polls from the app. */
  devicePollMs: 3000,
  /** Session cookie lifetime. */
  sessionDays: 30,
} as const;

type HubLimits = typeof HUB_LIMITS;

export { HUB_LIMITS };
export type { HubLimits };
