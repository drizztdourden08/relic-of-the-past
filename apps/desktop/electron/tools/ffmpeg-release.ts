/* @layer electron-main @kind logic */
import type { ToolDownload, ToolPlatform } from '@drizztdourden08/brock-tools/main';
import type { GithubReleaseAsset } from './ffmpeg-release.type';
import { FFMPEG_RELEASE_API, FFMPEG_RELEASE_TAG, FFMPEG_WINDOWS_ASSET, SHA256_PREFIX } from './ffmpeg-tool.constants';

const resolveFfmpegDownload = async (platform: ToolPlatform): Promise<ToolDownload | null> => {
  if (!platform.startsWith('win32-')) return null;
  const res = await fetch(`${FFMPEG_RELEASE_API}/${FFMPEG_RELEASE_TAG}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'relic-of-the-past' },
  });
  if (!res.ok) throw new Error(`Could not look up the ffmpeg release (HTTP ${res.status}).`);

  const data = await res.json() as { assets: GithubReleaseAsset[] };
  const asset = data.assets.find((a) => a.name === FFMPEG_WINDOWS_ASSET);
  if (!asset) throw new Error(`The ffmpeg release no longer publishes ${FFMPEG_WINDOWS_ASSET}.`);
  if (!asset.digest?.startsWith(SHA256_PREFIX)) throw new Error(`No sha256 digest published for ${FFMPEG_WINDOWS_ASSET}.`);

  return {
    url: asset.browser_download_url,
    sha256: asset.digest.slice(SHA256_PREFIX.length),
    size: asset.size,
    archive: 'zip',
  };
};

export { resolveFfmpegDownload };
