/* @layer shared-store @kind constants */
/**
 * Every cap the store site, the store API and the app agree on. One table, so a cap raised on
 * the server is raised in the upload form and the install check on the same commit.
 */
import type { StoreKind } from './types';

const KiB = 1024;
const MiB = 1024 * KiB;
const GiB = 1024 * MiB;
const MINUTE_MS = 60 * 1000;

/** Largest pack per kind, in bytes. A full MSU-1 soundtrack runs past 1.5 GB; sprites and text stay small. */
const PACK_BYTES: Record<StoreKind, number> = {
  music: 2 * GiB,
  character: 5 * MiB,
  language: 20 * MiB,
};

const STORE_LIMITS = {
  packBytes: PACK_BYTES,
  /** Every item's card: exact size, webp, at most this many bytes. */
  card: { width: 512, height: 288, bytes: 300 * KiB },
  /** The optional banner used when an item is featured. */
  banner: { width: 1280, height: 400, bytes: 800 * KiB },
  /** Downloads one player may start in a day. */
  downloadsPerDay: 40,
  /** Bytes one player may download in a day: a few full music packs. */
  downloadBytesPerDay: 8 * GiB,
  /** Bytes read from the head of an upload to find its manifest; a larger first entry is refused. */
  manifestHeadBytes: 1 * MiB,
  /** Largest manifest once inflated; a first entry claiming more is refused before inflating. */
  manifestBytes: 8 * MiB,
  /** Items per page of the catalogue listing. */
  itemsPageSize: 200,
  /** How long the built home page is served from cache. */
  homeCacheMs: 5 * MINUTE_MS,
  /** The window Popular counts installs over. */
  popularWindowDays: 30,
  /** Days an upload stays under incoming/ before the bucket lifecycle clears it. */
  incomingKeepDays: 45,
} as const;

type StoreLimits = typeof STORE_LIMITS;

export { STORE_LIMITS };
export type { StoreLimits };
