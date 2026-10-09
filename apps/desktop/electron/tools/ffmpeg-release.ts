/* @layer electron-main @kind logic */
import type { FfmpegRelease } from '@shared/types/ffmpeg-tool';
import type { GithubReleaseAsset, ResolvedFfmpegAsset } from './ffmpeg-release.type';

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
