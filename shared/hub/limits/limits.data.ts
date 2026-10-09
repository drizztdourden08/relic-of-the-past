/* @layer shared-hub @kind data */
const MIB = 1024 * 1024;
const MINUTE_MS = 60 * 1000;

const HUB_LIMITS = {
  partBytes: 64 * MIB,
  partsPerSign: 8,
  partUrlSeconds: 3600,
  previewUrlSeconds: 60 * 60 * 2,
  downloadUrlSeconds: 600,
  noteMaxChars: 200,
  deviceCodeTtlMs: 10 * MINUTE_MS,
  devicePollMs: 3000,
  sessionDays: 30,
} as const;

export { HUB_LIMITS };
