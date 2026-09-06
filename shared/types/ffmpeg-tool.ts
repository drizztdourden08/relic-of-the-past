/* @layer shared-types @kind constants */
/**
 * The optional ffmpeg tool: which build we install, and the states it can be in.
 *
 * ffmpeg is NOT bundled. It is fetched on request into the app's data root, so a user who
 * never asks never downloads 140 MB. The build is PINNED to one release, not a rolling
 * `latest` tag: a pinned tag plus checksum is the only way the bytes we run are the bytes we vetted.
 *
 * Windows is the only platform we download for. Linux builds ship as `.tar.xz`, which would
 * need an xz decompressor for a platform that has a package manager, so Linux uses PATH.
 */

/** One pinned upstream release asset. */
interface FfmpegRelease {
  /** Per-build release tag (`autobuild-YYYY-MM-DD-HH-MM`), never `latest`. */
  tag: string;
  /** Asset file name inside that release. */
  asset: string;
  /** Published asset size in bytes. Cheap to check before hashing. */
  sizeBytes: number;
  /** Lowercase hex SHA-256 of the asset, or the placeholder below. */
  sha256: string;
}

/** Placeholder for an unfilled checksum. Verification treats it as a hard failure, so an unverified archive is never run. */
const FFMPEG_SHA256_UNSET = 'TODO_FILL_FROM_PUBLISHED_CHECKSUM';

/**
 * The win64 LGPL static build of the 9.0 release branch (not master, so the pin does not move).
 *
 * The checksum comes from two independent sources that agree: the release's `checksums.sha256`
 * and the asset's `digest` in the GitHub release API; both agree with `sizeBytes`. Re-pinning
 * means repeating that: read the hash from upstream, never compute it from a downloaded file.
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

/** Lifecycle state. `unavailable` is terminal (platform not served); `failed` can be cleared by a retry. */
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
