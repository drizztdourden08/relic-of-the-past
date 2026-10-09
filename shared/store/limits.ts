/* @layer shared-store @kind data */
import type { StoreKind } from './types';

const KiB = 1024;
const MiB = 1024 * KiB;
const GiB = 1024 * MiB;
const MINUTE_MS = 60 * 1000;

const PACK_BYTES: Record<StoreKind, number> = {
  music: 2 * GiB,
  character: 5 * MiB,
  language: 20 * MiB,
};

const FILES_KEPT: Record<StoreKind, number> = {
  music: 2,
  character: 5,
  language: 5,
};

const STORE_LIMITS = {
  packBytes: PACK_BYTES,
  card: { width: 1280, height: 720, bytes: 500 * KiB },
  banner: { width: 1920, height: 640, bytes: 1 * MiB },
  downloadsPerDay: 40,
  downloadBytesPerDay: 8 * GiB,
  packPreviewsPerDay: 60,
  manifestHeadBytes: 1 * MiB,
  manifestBytes: 8 * MiB,
  itemsPageSize: 200,
  featuredMax: 12,
  homeCacheMs: 5 * MINUTE_MS,
  popularWindowDays: 30,
  incomingKeepDays: 45,
  rejectedKeepDays: 30,
  readyKeepDays: 45,
  filesKept: FILES_KEPT,
} as const;

export { STORE_LIMITS };
export type { StoreLimits } from './limits.type';
