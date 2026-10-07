/* @layer shared-types @kind constants */
/**
 * The optional ffmpeg tool: which build we install, and the states it can be in.
 *
 * ffmpeg is NOT bundled. It is fetched on request into the app's data root, so a user who
 * never asks never downloads 140 MB.
 *
 * BtbN/FFmpeg-Builds prunes its dated `autobuild-*` releases over time, so pinning to one of
 * those tags eventually 404s (this happened once already). The `latest` tag is the one release
 * that never gets deleted: BtbN republishes it in place with fresh binaries, under asset names
 * that don't change either (`ffmpeg-n9.0-latest-...`, built from the current stable release
 * branch, not a bleeding-edge master build). Because the bytes behind that name change over
 * time, the checksum can't be a build-time constant here - ffmpeg-release.ts fetches the
 * current one from the GitHub release API right before every install, so what gets run is
 * always checked against what BtbN is publishing right now.
 *
 * Windows is the only platform we download for. Linux builds ship as `.tar.xz`, which would
 * need an xz decompressor for a platform that has a package manager, so Linux uses PATH.
 */

/** One evergreen upstream release asset - a fixed name, not a fixed set of bytes. */
interface FfmpegRelease {
  /** Always `'latest'`: BtbN's one release tag that is never pruned. */
  tag: string;
  /** Asset file name inside that release. Also fixed, since BtbN names it after the release
   *  branch ("n9.0"), not a moving git-describe commit count. */
  asset: string;
}

/**
 * The win64 LGPL static build of the 9.0 release branch, not master - so this stays the
 * current stable series instead of tomorrow's build off master.
 */
const PINNED_FFMPEG: FfmpegRelease = {
  tag: 'latest',
  asset: 'ffmpeg-n9.0-latest-win64-lgpl-9.0.zip',
};

const FFMPEG_RELEASES_BASE = 'https://github.com/BtbN/FFmpeg-Builds/releases/download';

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

export { FFMPEG_LINUX_PACKAGE, FFMPEG_RELEASES_BASE, PINNED_FFMPEG };
export type { FfmpegRelease, FfmpegState };
