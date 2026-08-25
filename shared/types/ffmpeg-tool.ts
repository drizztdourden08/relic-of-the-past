/* @layer shared-types @kind constants */
/**
 * The optional ffmpeg tool: which build we install, and the states it can be in.
 *
 * ffmpeg is NOT bundled — it is fetched on request and kept under the app's own data
 * root, so a user who never asks for it never downloads 140 MB and an isolated launch
 * gets its own copy. The build is PINNED to one published release rather than a rolling
 * `latest` tag: a pinned tag plus a pinned checksum is the only way the bytes we run can
 * be the bytes we vetted.
 *
 * Windows is the only platform we download for. The project's builds ship the Linux
 * toolchain as `.tar.xz`, which would mean carrying an xz decompressor for one platform
 * that already has a package manager — so on Linux we use whatever is on PATH instead.
 */

/** One pinned upstream release asset. */
interface FfmpegRelease {
  /** Per-build release tag (`autobuild-YYYY-MM-DD-HH-MM`), never `latest`. */
  tag: string;
  /** Asset file name inside that release. */
  asset: string;
  /** Published asset size in bytes — a cheap sanity check before hashing. */
  sizeBytes: number;
  /** Lowercase hex SHA-256 of the asset, or the placeholder below. */
  sha256: string;
}

/**
 * Stands in for a checksum that has not been filled in yet. Verification treats it as a
 * hard failure, so an unverified archive can never be extracted and run.
 */
const FFMPEG_SHA256_UNSET = 'TODO_FILL_FROM_PUBLISHED_CHECKSUM';

/**
 * The win64 LGPL static build of the 9.0 release branch — a release branch rather than
 * master, so the pin does not move with upstream development.
 *
 * The checksum was taken from two independent places that agree: the `checksums.sha256`
 * manifest published in this same release, and the asset's own `digest` field in the
 * GitHub release API. Both also agree with `sizeBytes`. Re-pinning to a newer build means
 * repeating that: read the hash from upstream, never compute it from a file you downloaded
 * and already trusted.
 */
const PINNED_FFMPEG: FfmpegRelease = {
  tag: 'autobuild-2026-08-22-12-58',
  asset: 'ffmpeg-n9.0.1-6-g9d4ca21220-win64-lgpl-9.0.zip',
  sizeBytes: 147007729,
  sha256: '20f84639fae87181bb1c9899c34ce05cd3c0b533c68d3ff34206a2615da94f30',
};

const FFMPEG_RELEASES_BASE = 'https://github.com/BtbN/FFmpeg-Builds/releases/download';

/** Download URL of a pinned asset. */
const ffmpegAssetUrl = (release: FfmpegRelease): string =>
  `${FFMPEG_RELEASES_BASE}/${release.tag}/${release.asset}`;

/** True while the pinned checksum is still the placeholder. Verification must fail. */
const isChecksumUnset = (release: FfmpegRelease): boolean => release.sha256 === FFMPEG_SHA256_UNSET;

/** Package to install on a platform we do not download for. */
const FFMPEG_LINUX_PACKAGE = 'ffmpeg';

/**
 * Where the tool is in its lifecycle. `unavailable` is the terminal "this platform is
 * not served" answer (nothing to retry), as distinct from `failed`, which a retry can
 * clear.
 */
type FfmpegState =
  | { status: 'missing' }
  | { status: 'downloading'; receivedBytes: number; totalBytes: number }
  | { status: 'verifying' }
  | { status: 'ready'; ffmpegPath: string; ffprobePath: string }
  | { status: 'failed'; reason: string }
  | { status: 'unavailable'; reason: string; installPackage?: string };

export {
  FFMPEG_LINUX_PACKAGE, FFMPEG_RELEASES_BASE, FFMPEG_SHA256_UNSET, PINNED_FFMPEG,
  ffmpegAssetUrl, isChecksumUnset,
};
export type { FfmpegRelease, FfmpegState };
