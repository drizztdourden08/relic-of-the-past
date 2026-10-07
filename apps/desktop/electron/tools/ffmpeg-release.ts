/* @layer electron-main @kind logic */
/**
 * Resolves the pinned ffmpeg asset name against BtbN's `latest` release right before every
 * install, since that release's bytes (and so its checksum) change whenever BtbN rebuilds it.
 * The GitHub REST API hands back the asset's own published sha256 digest alongside its size
 * and download URL in one call, so nothing here computes or guesses a checksum - it only
 * relays what BtbN itself published for the exact bytes we're about to fetch.
 */
import type { FfmpegRelease } from '@shared/types/ffmpeg-tool';

interface ResolvedFfmpegAsset {
  downloadUrl: string;
  sizeBytes: number;
  sha256: string;
}

interface GithubReleaseAsset {
  name: string;
  size: number;
  digest: string | null;
  browser_download_url: string;
}

const releaseApiUrl = (tag: string): string =>
  `https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/tags/${tag}`;

const resolveFfmpegAsset = async (release: FfmpegRelease): Promise<ResolvedFfmpegAsset> => {
  const res = await fetch(releaseApiUrl(release.tag), {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'relic-of-the-past' },
  });
  if (!res.ok) throw new Error(`Could not look up the ffmpeg release (HTTP ${res.status}).`);

  const data = await res.json() as { assets: GithubReleaseAsset[] };
  const asset = data.assets.find((a) => a.name === release.asset);
  if (!asset) throw new Error(`The ffmpeg release no longer publishes ${release.asset}.`);
  if (!asset.digest?.startsWith('sha256:')) throw new Error(`No sha256 digest published for ${release.asset}.`);

  return {
    downloadUrl: asset.browser_download_url,
    sizeBytes: asset.size,
    sha256: asset.digest.slice('sha256:'.length),
  };
};

export { resolveFfmpegAsset };
export type { ResolvedFfmpegAsset };
